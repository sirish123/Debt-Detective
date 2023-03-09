import json;
import sys
#here we will be running safety which will analysise all the vulnerable packages available
if __name__ == '__main__':
    input_file = sys.argv[1];
    input_data = "";
    with open(input_file, "r") as f:
        input_data = f.read()
    python_dict= json.loads(input_data);
    returnDict = {};
    # Safety -> Vulnerabilities, package name , version, latest safe package version
    returnDict["vulnerabilities"] = python_dict["vulnerabilities"];
    jsonObject = json.dumps(returnDict,indent=0);
    print(jsonObject);