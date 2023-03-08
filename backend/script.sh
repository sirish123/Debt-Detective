#!/bin/bash
source venv/Scripts/activate
pip freeze > requirements.txt
safety check -r requirements.txt --output json > system_check.txt
python main.py system_check.txt
bandit main.py --format json > security_check.txt
echo "done"
