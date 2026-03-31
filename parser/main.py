# Entry point of FastAPI

# Purpose:
# Create API
# Accept resume text
# Call parser logic

from fastapi import FastAPI
from pydantic import BaseModel
from utils.parser import parse_resume

app = FastAPI()

class ResumeInput(BaseModel):
    text: str


@app.get("/")
def home():
    return {"message": "FastAPI Resume Parser Running"}


@app.post("/parse")
def parse(data: ResumeInput):
    result = parse_resume(data.text)
    return result