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
import  math
from collections import OrderedDict
import numpy as np
import os
import asyncio

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
    
    url = "https://libraries.io/api/{source}/{name}/sourcerank?api_key=7b7f69d0b46f645c7cfc7c6231db6ae6".format(source="Pypi",name=name)
    dict = requests.get(url).json();
    currScore += dict["readme_present"];
    #multiple versions
    if len(versionsArray) >1:
        currScore+=1
    #recent release
    try:
        currScore += dict["recent_release"]
    #not brand new
    except:
        currScore+=0
    try:
        currScore += dict["not_brand_new"]
    #dependent packages
    except:
        currScore+=0
    try:
        currScore += 2*math.ceil(math.log2(pythonDict["dependents_count"]));
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
    # #number of forks
    except:
        currScore+=0
    try:
        currScore += math.ceil(math.log2(pythonDict["forks"]))
    #contributors
    except:
        currScore+=0
    # try:
    #     url = "https://libraries.io/api/{source}/{name}/dependent_repositories?api_key=7b7f69d0b46f645c7cfc7c6231db6ae6".format(source="Pypi",name=name);
    #     dict2 = requests.get(url).json();
    #     currScore += math.ceil(math.log2(dict2["contributions_count"]))
    # except:
    try:
        currScore += dict["contributors"]
    except:
        currScore+=0
    return currScore

# test route
@app.post("/")
async def read_root(request: Request):
        communityScore = 0
        count = 0
        dependency_list = request.query_params["val"].split(",")
        input_data = ""

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
        dictVal = [];
        for dependency in dependency_list:
            curr_string  = dependency[:-1]
            try:
                [name,version] = curr_string.split('==')
                packages_arr.append(name)
            except:
                return {"error":curr_string}
            # dictVal.append(name+"*"+version)
            url = "https://libraries.io/api/{package}/{name}?api=7b7f69d0b46f645c7cfc7c6231db6ae6?".format(package="Pypi",name=name)
            # dictVal.append(url)
            if(url==""):
                continue
            pythonDic = ((requests.get(url)))
            try:
                pythonDict = pythonDic.json()
                returnDict = {}
                version = "";
                score = calcalculateLibrariesIOScore(pythonDict,name,pythonDict["versions"]);
                communityScore += score
                returnDict["PkgName"] = name;
                returnDict["stars"] = pythonDict["stars"]
                returnDict["forks"] = pythonDict["forks"]
                returnDict["score"] = score
                dictVal.append(returnDict);
                count +=1
            except:
                continue;
        vulnArray =[]
        if(len(python_dict_vul["vulnerabilities"])!=0):
            for i in range(len(python_dict_vul["vulnerabilities"])):
                python_vulnerable_packages = {}
                python_vulnerable_packages["CVE"] = python_dict_vul["vulnerabilities"][i]["CVE"]
                python_vulnerable_packages["advisory"] = python_dict_vul["vulnerabilities"][i]["advisory"]
                python_vulnerable_packages["package_name"] = name
                python_vulnerable_packages["analyzed_version"] = version
                vulnArray.append(python_vulnerable_packages);
        scores = [0 for x in range(5)]
        scores[0] = communityScore/count
        return {"scores":scores,"community":dictVal ,"vpkg":vulnArray};
        

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
    # print(packages_arr)
    packages_arr = ["numpy", "pandas"]  
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
        # print(questions_list[i].text)   
        final_questions[i] = final_questions[i].text  
    for i in range(len(final_votes)):
        final_votes[i] = int(final_votes[i])
        
    # print(len(final_questions))  
    questions_dict = {}
    for i in range(len(final_votes)):
        questions_dict[final_questions[i]] = final_votes[i]
        
    # keys = list(questions_dict.keys())
    # values = list(questions_dict.values())
    sorted_dict = dict(sorted(questions_dict.items(), key=lambda x: x[1], reverse=True)) 
    sorted_dict = dict(list(questions_dict.items())[:10]) 
    # print(sorted_dict)
    # res = json.dump(sorted_dict)
    return {"res" : sorted_dict}  

@app.get("/pkg")
async def pkg(request: Request): 
    data = request.query_params
    for key, value in data.items():
        print(key)
        print(value)
    return {"message": "Hello World"}
