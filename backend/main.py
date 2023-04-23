import logging
import traceback
from fastapi import FastAPI, Request
from typing import Union
from bs4 import BeautifulSoup
from urllib.request import urlopen
import requests
import json
import sys
from ratelimit import limits,sleep_and_retry
import subprocess
import math
from collections import OrderedDict
import numpy as np
from pylint.lint import Run
import os
import re


CALLS = 30;
RATE_LIMIT = 60;
app = FastAPI();
packages_arr = []
'''
libaries.io -> Github stars and forks, Number of dependants and number of items dependant on it, depricated packages
Safety -> Vulnerabilities, package name , version, latest safe package version
depricated packages-> package name, version, latest version, reason for deprication
Stackoverflow give the top 10 questions
pipdeptree -> give the problematic version list
'''
#enable CORS
@app.middleware("http")   
async def add_cors_headers(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


def calcalculateLibrariesIOScore(pythonDict,name,versionsArray):
    currScore = 0
    #has readme
    community_subparameters = {}
    community_subparameters["age_of_repo"] = 0 #
    community_subparameters["contributors"]  = 0 
    community_subparameters["dependents"] =0 #
    community_subparameters["multiple_version"] = 0 #
    community_subparameters["readme"] = 0 #
    community_subparameters["recent_releases"] = 0 #
    community_subparameters["stars_and_forks"] = 0 #

    url = "https://libraries.io/api/{source}/{name}/sourcerank?api_key=7b7f69d0b46f645c7cfc7c6231db6ae6".format(source="Pypi",name=name)
    dict = requests.get(url).json();
    currScore += dict["readme_present"];
    community_subparameters["readme"] =  dict["readme_present"]
    #multiple versions 
    if len(versionsArray) >1:
        currScore+=1
        community_subparameters["multiple_version"] = 1
    #recent release
    try:
        currScore += dict["recent_release"]
        community_subparameters["recent_releases"] =  dict["recent_release"]
    #not brand new
    except:
        currScore+=0
    try:
        currScore += dict["not_brand_new"]
        community_subparameters["age_of_repo"] = dict["not_brand_new"]
    #dependent packages
    except:
        currScore+=0
    try:
        currScore += 2*math.ceil(math.log2(pythonDict["dependents_count"]));
        community_subparameters["dependents"] = 2*math.ceil(math.log2(pythonDict["dependents_count"]))
    #dependent repositories
    except:
        currScore+=0
    try:
        currScore += math.ceil(math.log2(pythonDict["dependent_repos_count"]));
        
    # #number of stars
    except:
        currScore+=0
    try:
        currScore += math.ceil(math.log2(pythonDict["stars"]))
        community_subparameters["stars_and_forks"] = math.ceil(math.log2(pythonDict["stars"]))
    # #number of forks
    except:
        currScore+=0
    try:
        currScore += math.ceil(math.log2(pythonDict["forks"]))
        community_subparameters["stars_and_forks"] += math.ceil(math.log2(pythonDict["forks"]))
    #contributors
    except:
        currScore+=0
    try:
        currScore += dict["contributors"]
        community_subparameters["contributors"] = dict["contributors"]
    except:
        currScore+=0
    return [currScore,community_subparameters]

# test route
@app.post("/")
async def read_root(request: Request):
        communityScore = 0
        count = 0
        dependency_list = request.query_params["val"].split(",")
        input_data = ""
        comm_sub_params = {}
        with open ("requirements.txt","w+") as f:
            for items in dependency_list:
                f.write(items+"\n")
        try:
            subprocess.run("safety check -r requirements.txt --output json > system_check.txt",shell=True)
        except Exception as e:
            logging.error(traceback.format_exc())
            return {"no":"error"}
        with open("system_check.txt", "r") as f:
            input_data = f.read()
        python_dict_vul= json.loads(input_data);
        dictVal = []
        for dependency in dependency_list:
            curr_string  = dependency[:-1]
            try:
                [name,version] = curr_string.split('==')
                packages_arr.append(name)
            except:
                return {"error":curr_string}
            url = "https://libraries.io/api/{package}/{name}?api=7b7f69d0b46f645c7cfc7c6231db6ae6?".format(package="Pypi",name=name)
            if(url==""):
                continue
            pythonDic = ((requests.get(url)))
            try:
                pythonDict = pythonDic.json()
                returnDict = {}
                version = ""
                [score,commuity_subparameters] = calcalculateLibrariesIOScore(pythonDict,name,pythonDict["versions"])
                communityScore += score
                returnDict["PkgName"] = name
                returnDict["stars"] = pythonDict["stars"]
                returnDict["forks"] = pythonDict["forks"]
                returnDict["score"] = score
                returnDict["community_subparameters"] = commuity_subparameters
                dictVal.append(returnDict)
                count +=1
            except:
                continue
        vulnArray =[]
        vulCount =0
        vulScore = 0
        if(len(python_dict_vul["vulnerabilities"])!=0):
            for i in range(len(python_dict_vul["vulnerabilities"])):
                python_vulnerable_packages = {}
                python_vulnerable_packages["CVE"] = python_dict_vul["vulnerabilities"][i]["CVE"]
                if(python_vulnerable_packages["CVE"]==0):
                    continue;
                python_vulnerable_packages["advisory"] = python_dict_vul["vulnerabilities"][i]["advisory"].replace("'","");
                # python_vulnerable_packages["advisory"] 
                # new_string = python_vulnerable_packages["advisory"].replace("'","")
                python_vulnerable_packages["package_name"] = name
                python_vulnerable_packages["analyzed_version"] = version
                vulnArray.append(python_vulnerable_packages);
                try:
                    url = "https://services.nvd.nist.gov/rest/json/cves/2.0?cveId={cve}".format(cve = python_vulnerable_packages["CVE"])
                    x=0;
                    cveDict = requests.get(url).json()
                    tempes =0
                    tempis =0
                    for i in range(len(cveDict["vulnerabilities"][0]["cve"]["metrics"]["cvssMetricV31"])):
                        tempes += cveDict["vulnerabilities"][0]["cve"]["metrics"]["cvssMetricV31"][i]["exploitabilityScore"];
                        tempis += cveDict["vulnerabilities"][0]["cve"]["metrics"]["cvssMetricV31"][i]["impactScore"];
                        vulCount +=1
                    vulScore += (tempis + tempes)

                except:
                    logging.error(traceback.format_exc())
                    continue;
        scores = [];
        scores.append(communityScore/count);
        if(vulCount!=0):
            scores.append((vulScore/vulCount)*10);
        for i in range(3):
            scores.append(0)
        return {"scores":scores,"community":dictVal ,"vpkg":vulnArray}
        
@app.get("/security")
def security():
    input_data = ""
    with open("bandit_output.json", "r") as f:
        input_data = f.read()
    
    python_dict_vul= json.loads(input_data)
    SECURITY_ARRAY = []
    for i in range(len(python_dict_vul["results"])):
        resDict = {}
        resDict["SEVERITY"] = python_dict_vul["results"][i]["issue_severity"]
        resDict["CONFIDENCE"] = python_dict_vul["results"][i]["issue_confidence"]
        resDict["PROBLEM"] =  python_dict_vul["results"][i]["issue_text"]
        resDict["LINENUMBER"] = python_dict_vul["results"][i]["line_number"]
        resDict["COLOFFSET"] = python_dict_vul["results"][i]["col_offset"]
        resDict["CWE_ID"] = python_dict_vul["results"][i]["issue_cwe"]["id"]
        SECURITY_ARRAY.append(resDict)
    return SECURITY_ARRAY


# gets data from osv database for the given package
@app.get("/osv")
async def osv():
    url = "https://api.osv.dev/v1/query"
    data = '{"version": "0.9.6", "package": {"name": "numpy", "ecosystem": "PyPI"}}'
    response = requests.post(url, data=data)
    return response.json()

@app.post("/safety")
async def safety(packages: Request):
    packages_info = await packages.json()
    return {
        "data": packages_info
    }

@app.get("/stack")
def scrapeStack():
    packages_arr = ["numpy", "pandas","tensorflow","requests"]   
    final_votes = []
    final_questions = []
    def getresults(package):
     
        URL = "https://stackoverflow.com/questions/tagged/{pname}?tab=votes&pagesize=15".format(pname=package)
        print(URL)

        response = urlopen(URL)
        html = response.read()    
        
        soup = BeautifulSoup(html, features="html.parser")   
    
        # have to add some check for empty array
        questions_list = soup.find_all("h3", class_ = "s-post-summary--content-title")
        question_stats = soup.find_all("span", class_="s-post-summary--stats-item-number")  
        
        votes_list = []
        for i in range(len(question_stats)):
            if i % 3 == 0:
                votes_list.append(question_stats[i].text)
        
        if len(questions_list)!= 0:
            votes_list = votes_list[:10]
            questions_list = questions_list[:10]
            
        
        final_votes.extend(votes_list) 
        final_questions.extend(questions_list)
        
        
    
    for i in range(len(packages_arr)):  
        getresults(packages_arr[i])
        
    for i in range(len(final_questions)):
        final_questions[i] = final_questions[i].text  
    for i in range(len(final_votes)):
        final_votes[i] = int(final_votes[i])
    questions_dict = {}
    for i in range(len(final_votes)):
        questions_dict[final_questions[i]] = final_votes[i]
    sorted_dict = dict(sorted(questions_dict.items(), key=lambda x: x[1], reverse=True)) 
    sorted_dict = dict(list(sorted_dict.items())[:10]) 
    return {"res" : sorted_dict}  

@app.get("/pkg")
async def pkg(request: Request): 
    data = request.query_params
    for key, value in data.items():
        print(key)
        print(value)
    return {"message": "Hello World"}

@app.post("/coder")
async def code(request: Request):
    try:
        subprocess.run("bandit main.py -f json -o bandit_output.json > bandit_output.json",shell=True)
    except Exception as e:
        logging.error(traceback.format_exc())
    data = await request.json()
    print(data)
@app.post("/linter")
async def linter(request: Request):
    print(request);
    input_data = ""
    with open("bandit_output.json", "r") as f:
        input_data = f.read()
    
    python_dict_linter= json.loads(input_data)
    try:
        subprocess.run("pylint example.py --output-format=json > pylint_output.json",shell=True)
    except Exception as e:
        logging.error(traceback.format_exc())
    # data = await request.json()
    return {"message": "Hello World"}

@app.get("/code")
async def linter(code: str):
    with open("pylint_output.py", "w+") as f:
        print(code)
        lines = code.split("\n")
        for line in lines:
            f.write(line)
        f.close()
    pylint_score = 0
    results = None
    try:
        subprocess.run("pylint --rcfile=.pylintrc pylint_output.py --output-format=json > pylint_output.json",shell=True)
        # subprocess.run("pylint --output-format=json your_file.py > pylint_report.json",shell=True)
        file_path = os.getcwd() + "/pylint_output.py"
        results = Run([file_path],do_exit=False)
        # pylint_score = results.linter.stats['global_note']
    except Exception as e:
        return {"message": "Hello World"}
    input_data = ""
    with open("pylint_output.json", "r") as f:
        input_data = f.read()
    python_dict_vul= json.loads(input_data)
    LINTER_ARRAY = []
    seen_lines = []
    for result in python_dict_vul:
        if result["message"] and result["message"] == "Final newline missing":
            continue
        if result["line"] in seen_lines:
            continue
        resDict = {}
        resDict["line"] = result["line"]
        resDict["column"] = result["column"]
        resDict["message"] = result["message"]
        resDict["endLine"] = result["endLine"]
        resDict["endColumn"] = result["endColumn"]
        LINTER_ARRAY.append(resDict)
        seen_lines.append(result["line"])

    try:
        subprocess.run("bandit  pylint_output.py -f json -o bandit_output.json",shell=True)
    except Exception as e:
        logging.error(traceback.format_exc())
    input_data = ""
    with open("bandit_output.json", "r") as f:
        input_data = f.read()
    python_dict_bandit= json.loads(input_data)
    SECURITY_ARRAY = []
    total_security_score = 0
    code_security_score = 0
    for i in range(len(python_dict_bandit["results"])):
        resDict = {}
        resDict["SEVERITY"] = python_dict_bandit["results"][i]["issue_severity"]
        resDict["CONFIDENCE"] = python_dict_bandit["results"][i]["issue_confidence"]
        resDict["PROBLEM"] =  python_dict_bandit["results"][i]["issue_text"]
        resDict["LINENUMBER"] = python_dict_bandit["results"][i]["line_number"]
        resDict["COLOFFSET"] = python_dict_bandit["results"][i]["col_offset"]
        resDict["CWE_ID"] = python_dict_bandit["results"][i]["issue_cwe"]["id"]
        severity_score = 0
        if(resDict["SEVERITY"] == "LOW"):
            severity_score = 1
        elif(resDict["SEVERITY"] == "MEDIUM"):
            severity_score = 3
        elif(resDict["SEVERITY"] == "HIGH"):
            severity_score = 5
        confidence_score =0
        if(resDict["CONFIDENCE"] == "LOW"):
            confidence_score = 1
        elif(resDict["CONFIDENCE"] == "MEDIUM"):
            confidence_score = 3
        elif(resDict["CONFIDENCE"] == "HIGH"):
            confidence_score = 5
        code_security_score += (severity_score*confidence_score);
        total_security_score += 25
        SECURITY_ARRAY.append(resDict)
    if total_security_score == 0:
        total_security_score = 1
    security_score = (code_security_score/total_security_score)*100
    severity_score = 100-(security_score)
    tempJson = (results.linter.stats)
    try:
        vulture_output = subprocess.check_output(['vulture', 'pylint_output.py'], stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as e:
        vulture_output = e.output

    vulture_output_str = vulture_output.decode().replace("'", "")
    


    pattern = r'^([\w\.]+):(\d+):\s(.+)$'


    output_lines = []
    for line in vulture_output_str.split('\n'):
        match = re.match(pattern, line.strip())
        if match:
            line_number = int(match.group(2))
            message = match.group(3).strip("'")
            output_lines.append((line_number, message))


    output_dict = {vulture_output: [{line_number: line_number, message: message} for line_number, message in output_lines]}
    output_list = [{line_number: line_number, message: message} for line_number, message in output_lines]


    vulture_json = json.dumps(output_dict)


    with open('vulture_output.json', 'w') as f:
        json.dump(output_dict, f)
    return {"SECURITY_ARRAY": SECURITY_ARRAY, "LINTER": LINTER_ARRAY, "PYLINT_SCORE": tempJson.global_note,"SECURITY_SCORE":security_score,"VULTURE_OUTPUT": vulture_json}
#  "VULTURE_OUTPUT": vulture_json
    