from fastapi import FastAPI, Request;
from typing import Union
import requests
from fastapi import FastAPI
import json
import sys;
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
@app.get("/")
async def read_root():
    f = open("requirements.txt","r");
    dictVal = [];
    with open("requirements.txt", "r") as f:
        curr_string = f.read();
        [name,version] = curr_string.split('==');
        url = "https://libraries.io/api/{package}/{name}?api=7b7f69d0b46f645c7cfc7c6231db6ae6?".format(package="Pypi",name=name);
        pythonDict = json.loads((requests.get(url)).text)
        returnDict = {}
        version = "";
        returnDict["stars"] = pythonDict["stars"]
        returnDict["forks"] = pythonDict["forks"]
        returnDict["dependents_count"] = pythonDict["dependents_count"];
        returnDict["is_deprecated"] = not (version == pythonDict["latest_release_number"]  or version == pythonDict["latest_stable_release_number"])
        jsonObject = json.dumps(returnDict);
        dictVal.append(jsonObject);
    return {};

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
