from typing import Union
import requests
from fastapi import FastAPI
import json
import sys;
app = FastAPI();
@app.get("/")
async def read_root():
    package = "Pypi";
    name = "numpy";
    # url = "https://libraries.io/api/%s/%s?api=7b7f69d0b46f645c7cfc7c6231db6ae6?",%(package,name);
    url = "https://libraries.io/api/{package}/{name}?api=7b7f69d0b46f645c7cfc7c6231db6ae6?".format(package="Pypi",name="numpy");
    print(url);
    data = '{"api_key" = "7b7f69d0b46f645c7cfc7c6231db6ae6"}';
    return requests.get(url).json();

# gets data from osv database for the given package
@app.get("/osv")
async def osv():    
    url = "https://api.osv.dev/v1/query"
    data = '{"version": "2.4.1", "package": {"name": "jinja2", "ecosystem": "PyPI"}}'

    response = requests.post(url, data=data)
    
    return response.json()
