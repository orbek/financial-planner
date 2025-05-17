import fitz  # PyMuPDF
import pandas as pd
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
import re

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_PROJECT_ID = os.getenv("GOOGLE_PROJECT_ID")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-pro")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel(GEMINI_MODEL)

def extract_text_from_pdf(file) -> str:
    doc = fitz.open(stream=file.read(), filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def extract_transactions_with_llm(text: str) -> pd.DataFrame:
    prompt = f"""
You are a financial assistant. Extract structured transaction data from the bank statement text below.
Each transaction should include the following fields: Date, Amount, Type (Income/Expense), and Description.
Return the result as a JSON list of objects.

Bank Statement Text:
{text}
    """

    try:
        response = model.generate_content(prompt)
        content = response.text.strip()
        print("Gemini raw response:", content)

        # Remove Markdown code block if present
        if content.startswith("```"):
            content = re.sub(r"^```[a-zA-Z]*\n?", "", content)  # Remove opening ```
            content = re.sub(r"\n?```$", "", content)           # Remove closing ```
            content = content.strip()

        if not content:
            print("Gemini response was empty!")
            return pd.DataFrame()
        data = json.loads(content)
        return pd.DataFrame(data)
    except Exception as e:
        print("Error parsing Gemini response:", e)
        return pd.DataFrame()

def parse_pdf(file) -> pd.DataFrame:
    raw_text = extract_text_from_pdf(file)
    return extract_transactions_with_llm(raw_text)