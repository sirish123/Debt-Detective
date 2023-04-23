import subprocess
import re
import json


try:
    vulture_output = subprocess.check_output(['vulture', 'example.py'], stderr=subprocess.STDOUT)
except subprocess.CalledProcessError as e:
    vulture_output = e.output

vulture_output_str = vulture_output.decode().replace("'", "")
print(vulture_output_str)


pattern = r'^([\w\.]+):(\d+):\s(.+)$'


output_lines = []
for line in vulture_output_str.split('\n'):
    match = re.match(pattern, line.strip())
    if match:
        line_number = int(match.group(2))
        message = match.group(3).strip("'")
        output_lines.append((line_number, message))


output_dict = {'vulture_output': [{'line_number': line_number, 'message': message} for line_number, message in output_lines]}
output_list = [{'line_number': line_number, 'message': message} for line_number, message in output_lines]


vulture_json = json.dumps(output_dict)


with open('vulture_output.json', 'w') as f:
    json.dump(output_dict, f)

print(vulture_json)
