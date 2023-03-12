from bs4 import BeautifulSoup
import requests
from urllib.request import urlopen
import csv

package_arr = ["numpy"]
version_arr = ["1.24.0"]
 
def getresults(package,version):
     
    URL = "https://stackoverflow.com/questions/tagged/{pname}?tab=votes&pagesize=15".format(pname=package)
    print(URL)

    response = urlopen(URL)     
    html = response.read()    
    
    soup = BeautifulSoup(html, features="html.parser")   
   
    questions_list = soup.find_all("h3", class_ = "s-post-summary--content-title")
    question_stats = soup.find_all("span", class_="s-post-summary--stats-item-number")  
    
    votes_list = []
    for i in range(len(question_stats)):
        if i % 3 == 0:
            votes_list.append(question_stats[i].text)
            
    votes_list = votes_list[:10]
    questions_list = questions_list[:10]
    
    for i in range(len(questions_list)):
        # print(questions_list[i].text)   
        questions_list[i] = questions_list[i].text
    
    for q in questions_list:
        print(q) 
 

for i in range(len(package_arr)):
    getresults(package_arr[i], version_arr[i])