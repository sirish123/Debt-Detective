import json;
import sys
if __name__ == '__main__':
    input_file = sys.argv[1];
    input_data = "";
    with open(input_file, "r") as f:
        input_data = f.read()
    python_dict= json.loads(input_data);
    print(python_dict["affected_packages"]);