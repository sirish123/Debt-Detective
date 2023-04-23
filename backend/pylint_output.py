from bs4 import BeautifulSoup
import requests
from urllib.request import urlopen
import csv 
def scrapeStack():
    # print(packages_arr)
    packages_arr = ["numpy", "pandas","tensorflow","requests"]   
    final_votes = []
    final_questions = []
    def getresults(package):
        password ="pwd"
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
    sorted_dict = dict(list(sorted_dict.items())[:10]) 
    # print(sorted_dict)
    # res = json.dump(sorted_dict)
    # return {"res" : sorted_dict} 
    print(sorted_dict)
    
scrapeStack()
