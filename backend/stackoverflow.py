import requests
from bs4 import BeautifulSoup

# define the URL to scrape
url = "https://stackoverflow.com/questions/tagged/python"

# define the headers to simulate a browser visit
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"}

# send a GET request to the URL
response = requests.get(url, headers=headers)

# parse the HTML content using BeautifulSoup
soup = BeautifulSoup(response.content, "html.parser")

# find all the questions on the page
questions = soup.find_all("div", {"class": "question-summary"})

# iterate over each question and print its title and URL
for q in questions:
    title = q.find("a", {"class": "question-hyperlink"}).text.strip()
    url = q.find("a", {"class": "question-hyperlink"})["href"]
    print(f"{title}\n{url}\n")
