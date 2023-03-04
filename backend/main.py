from typing import Union;
import requests
from fastapi import FastAPI;

app = FastAPI();

@app.get("/")
def read_root():
    return {"Hello":"World"};

# gets data from osv database for the given package
@app.get("/osv")
async def osv():
    
    url = "https://api.osv.dev/v1/query"
    data = '{"version": "0.9.6", "package": {"name": "numpy", "ecosystem": "PyPI"}}'

    response = requests.post(url, data=data)
    
    return response.json()
