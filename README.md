# FinTwin — AI Financial Co-Pilot by SBI

A conversational AI that builds your Financial Twin in 5 minutes and proactively manages your financial health.

## What it does
- Builds a Financial Twin through natural conversation with Finn (AI advisor)
- Computes real-time financial health score (0-100)
- Detects financial gaps and maps to SBI products
- Proactively fires nudges without user asking (Agentic AI)
- What-if scenario simulator

## Tech Stack
- **Backend**: Python, FastAPI, Groq (llama-3.3-70b)
- **Frontend**: React, Vite
- **AI**: Agentic nudge engine, structured LLM extraction

## Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn groq python-dotenv
cp .env.example .env  # Add your GROQ_API_KEY
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Problem Statements Addressed
1. Customer Acquisition — 5-min conversational onboarding
2. Digital Adoption — contextual SBI product recommendations  
3. Digital Engagement — proactive agentic nudges
