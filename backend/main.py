from fastapi import FastAPI;
from typing import Union;
import requests

app = FastAPI();

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
async def root():
    return {"message": "Hello World"}

# gets data from osv database for the given package
@app.get("/osv")
async def osv():
    
    url = "https://api.osv.dev/v1/query"
    data = '{"version": "2.4.1", "package": {"name": "jinja2", "ecosystem": "PyPI"}}'

    response = requests.post(url, data=data)
    
    return response.json()
