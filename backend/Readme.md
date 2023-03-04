//creating a virtual environment
pip install env
python -m venv venv 
venv/Scripts/Activate

//To install the required dependencies use
pip install -r requirements.txt

//To start the server
uvicorn main:app --reload