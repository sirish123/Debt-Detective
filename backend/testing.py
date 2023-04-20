import requests

# Set the CWE ID to fetch CVEs for
cwe_id = 'CWE-287'

# Build the API request URL
base_url = 'https://services.nvd.nist.gov/rest/json/cves/2.0/'
request_url = f"{base_url}?resultsPerPage=1&cweId={cwe_id}"

# Send the API request and get the response
response = requests.get(request_url)

print(response.json())
