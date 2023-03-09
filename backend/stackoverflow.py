from bs4 import BeautifulSoup
import requests
from urllib.request import urlopen
import csv

URL = "https://stackoverflow.com/questions"

response = urlopen(URL)
html = response.read()

soup = BeautifulSoup(html, features="html.parser")

questions_list = soup.find_all("h3", class_ = "s-post-summary--content-title")

for q in questions_list:
    print(q.text)