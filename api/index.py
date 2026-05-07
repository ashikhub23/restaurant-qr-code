from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Website is working!"

app = app