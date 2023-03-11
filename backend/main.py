from fastapi import FastAPI, Request;
from typing import Union
import requests
import json
import sys
from ratelimit import limits,sleep_and_retry
import subprocess
CALLS = 30;
RATE_LIMIT = 60;
app = FastAPI();
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

# test route
@sleep_and_retry
@limits(calls=CALLS,period=RATE_LIMIT)
@app.post("/")
async def read_root(request: Request):
        for key,value in request.query_params.items():
            print(key,value)
        dependency_list = request.query_params["val"].split(",")
        input_data = "";
        with open ("requirements.txt","w+") as f:
            for items in dependency_list:
                f.write(items);
        subprocess.run(["./script.sh"]);
        with open("system_check.txt", "r") as f:
            input_data = f.read()
        python_dict_vul= json.loads(input_data);
        dictVal = [];
        
        for dependency in dependency_list:
            curr_string  = dependency[:-1]
            try:
                [name,version] = curr_string.split('==')
                print(name,version)
            except:
                return {"error":curr_string}
            # dictVal.append(name+"*"+version);
            url = "https://libraries.io/api/{package}/{name}?api=7b7f69d0b46f645c7cfc7c6231db6ae6?".format(package="Pypi",name=name);
            # dictVal.append(url);
            if(url==""):
                continue;
            pythonDic = ((requests.get(url)));
            try:
                pythonDict = pythonDic.json();
                returnDict = {}
                version = "";
                returnDict["name"] = name;
                returnDict["stars"] = pythonDict["stars"]
                returnDict["forks"] = pythonDict["forks"]
                returnDict["dependents_count"] = pythonDict["dependents_count"];
                returnDict["is_deprecated"] = not (version == pythonDict["latest_release_number"]  or version == pythonDict["latest_stable_release_number"])
                dictVal.append(returnDict);
            except:
                continue;
        return {"libio":dictVal ,  "vulnerabilities":python_dict_vul["vulnerabilities"]};
        

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


@app.get("/pkg")
async def pkg(request: Request): 
    data = request.query_params
    for key, value in data.items():
        print(key)
        print(value)
    return {"message": "Hello World"}
