from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()  # reads your .env file

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "user", "content": "Say hello and tell me you are ready to build FinTwin."}
    ]
)

print(response.choices[0].message.content)