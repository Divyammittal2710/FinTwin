from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

EXTRACTION_PROMPT = """
You are Finn, a friendly financial advisor AI for SBI Bank. Have a warm conversation 
and extract financial information from the user.

After each user message, respond with a JSON object containing:
1. "message": Your conversational reply (warm, concise, max 2 sentences)
2. "extracted": Any new financial data you learned
3. "quick_replies": A list of 2-4 short suggested replies the user can tap (optional, only when helpful)

Available fields to extract:
- name (string)
- age (integer)
- monthly_income (integer, in rupees)
- fixed_expenses (integer, in rupees)
- variable_expenses (integer, in rupees)
- savings_account (integer, in rupees)
- investments (integer, in rupees)
- risk_appetite (string: conservative/moderate/aggressive)
- goals (list of strings)
- life_stage (string: student/young_professional/married/parent/pre_retirement)
- loans (list of objects with type, outstanding, emi)
- dependents (integer)

RULES:
- Your ENTIRE response must be valid JSON. Start with { and end with }. Nothing before or after.
- Never include any text outside the JSON object.
- Be warm and conversational in the message field, not clinical.
- Ask ONE question at a time.
- quick_replies should be short (under 5 words each).
- Use quick_replies for: yes/no questions, multiple choice, risk appetite, life stage.
- Don't use quick_replies for: name, exact amounts (let them type those).
- Amounts always as integers in rupees.
- age must always be an integer, never a range like "20s" or "18-25".

Example:
{{
  "message": "Great to meet you! Are you currently employed or running a business?",
  "extracted": {{ "name": "Rahul", "age": 25 }},
  "quick_replies": ["Salaried", "Business Owner", "Freelancer", "Student"]
}}
"""

def chat_and_extract(conversation_history: list) -> dict:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": EXTRACTION_PROMPT},
            *conversation_history
        ],
        temperature=0.7,
        max_tokens=1000
    )

    raw = response.choices[0].message.content

    try:
        clean = raw.strip()

        # Remove markdown code blocks if present
        if "```" in clean:
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]

        # Find JSON object even if there's stray text around it
        start = clean.find("{")
        end = clean.rfind("}") + 1
        if start != -1 and end > start:
            clean = clean[start:end]

        result = json.loads(clean)

        # Ensure message is always a plain string
        if isinstance(result.get("message"), dict):
            result["message"] = str(result["message"])

        # Ensure quick_replies is always a list
        if not isinstance(result.get("quick_replies"), list):
            result["quick_replies"] = []

        # Ensure extracted is always a dict
        if not isinstance(result.get("extracted"), dict):
            result["extracted"] = {}

    except json.JSONDecodeError:
        result = {
            "message": raw,
            "extracted": {},
            "quick_replies": []
        }

    return result