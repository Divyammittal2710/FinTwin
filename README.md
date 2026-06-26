# FinTwin — AI Financial Co-Pilot by SBI

> **Hackathon Project** — Agentic AI & Emerging Tech Track  
> Problem Statements Covered: Customer Acquisition · Digital Adoption · Digital Engagement

---

## What is FinTwin?

FinTwin builds a **digital replica of a person's financial life** through a 5-minute natural conversation — no forms, no branch visit. The AI advisor Finn asks smart questions, extracts a complete financial profile, and instantly surfaces personalized insights, product recommendations, and proactive alerts.

The core insight: **most banking is reactive** — you come to the bank with a need, they serve it. FinTwin flips this — the bank understands you deeply enough to anticipate needs before you articulate them.

---

## One Twin. Three Business Outcomes.

| Problem Statement | How FinTwin Solves It |
|---|---|
| **Customer Acquisition** | Conversational KYC in 5 minutes. Finn onboards users through natural chat, extracts a richer profile than any form, and instantly maps them to the right SBI product. |
| **Digital Adoption** | Twin detects financial gaps and surfaces relevant SBI products in context — without the user asking. Spend patterns trigger cashback card suggestions. Salary credited triggers SIP nudge. |
| **Digital Engagement** | Proactive agentic nudge engine fires alerts based on life events, behavioral patterns, and financial health score changes. Engagement never goes dark. |

---

## Features

### Finn — AI Financial Advisor
- Natural conversation extracts financial profile (income, expenses, savings, goals, risk appetite)
- Context-aware — asks different questions for students vs professionals
- Quick reply chips for common answers, free text for specific amounts
- Conversation history maintained for coherent multi-turn dialogue

### Financial Twin Dashboard
- **Health Score (0-100)** — single number summarizing financial health, color-coded
- **Overview** — key metrics (income, savings, net worth, emergency fund) + action items
- **Budget** — monthly breakdown pie chart + goal timeline calculator
- **Goals** — progress bars with allocation slider (realistic multi-goal planning)
- **Recommendations** — personalized SBI product cards mapped to detected gaps
- **Where to Invest** — investment options ranked by risk appetite (conservative/moderate/aggressive)
- **Simulator** — what-if scenario engine ("what if I save ₹10,000 more/month?")

### Agentic Nudge Engine
Proactively detects and fires alerts without user asking:
- Emergency fund critically low → urgent alert
- Start of month salary credited → SIP timing nudge
- High variable spend → cashback card opportunity
- High net worth → diversification suggestion
- Age-based retirement planning insights
- Pre-qualified product offers based on profile

### Smart Financial Logic
- Student-aware scoring (different metrics, realistic expectations)
- 3-month emergency fund target for professionals
- 20% savings rate benchmark
- Goal timeline with and without 7.1% FD returns
- Allocation slider for multi-goal planning

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Recharts |
| **Backend** | Python, FastAPI, Uvicorn |
| **AI/LLM** | Groq API (llama-3.3-70b-versatile) |
| **Architecture** | REST API, in-memory session store |

---

## Project Structure

```
FinTwin/
├── backend/
│   ├── main.py              # FastAPI app, all API routes
│   ├── llm_service.py       # Groq LLM calls, structured extraction
│   ├── twin_engine.py       # Financial Twin object, metrics, health score
│   ├── nudge_engine.py      # Proactive agentic nudge logic
│   ├── products.py          # SBI product catalog + recommendation engine
│   └── test_groq.py         # Groq connection test
├── frontend/
│   ├── src/
│   │   └── App.jsx          # Full React app (single file)
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md
```

---

## Setup & Running

### Prerequisites
- Python 3.9+
- Node.js 18+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install fastapi uvicorn groq python-dotenv
```

Create `backend/.env`:
```
GROQ_API_KEY=your_groq_api_key_here
```

Start the server:
```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Backend health check |
| `POST` | `/chat` | Send message to Finn, returns reply + twin update |
| `GET` | `/twin/{session_id}` | Get current Financial Twin object |
| `GET` | `/recommendations/{session_id}` | Get personalized SBI product recommendations |
| `GET` | `/nudges/{session_id}` | Get proactive nudges (agentic layer) |
| `GET` | `/investment-guide/{session_id}` | Get investment options by risk appetite |
| `POST` | `/scenario` | Run what-if simulation |

---

## How the Agentic Layer Works

```
Twin State Change
      ↓
Nudge Engine analyzes 12 triggers
      ↓
Relevant nudges generated (priority sorted)
      ↓
Frontend polls every 30 seconds
      ↓
Proactive alerts shown without user asking
```

This is what makes FinTwin **agentic** — it doesn't wait for the user to ask. It observes the twin state and acts.

---

## Financial Twin Data Model

```python
{
  "name": "Divyam",
  "age": 25,
  "life_stage": "young_professional",
  "monthly_income": 85000,
  "fixed_expenses": 35000,
  "variable_expenses": 20000,
  "savings_account": 150000,
  "investments": 50000,
  "risk_appetite": "moderate",
  "goals": ["Buy a car", "Europe trip"],
  "loans": [],
  "dependents": 0,

  # Computed
  "monthly_savings": 30000,
  "net_worth": 200000,
  "emergency_fund_months": 2.5,
  "health_score": 67,
  "gaps": [
    {"type": "emergency_fund", "severity": "medium", "gap_amount": 45000},
    {"type": "investment", "severity": "medium", "gap_amount": 7000}
  ]
}
```

---

## SBI Products Mapped

- **SBI Savings Plus Account** — emergency fund gap
- **SBI Mutual Fund SIP** — investment gap
- **SBI Life eShield Next** — insurance gap
- **NPS via SBI Pension Fund** — retirement gap
- **SBI ELSS Tax Saver Fund** — high income tax saving
- **SBI Fixed Deposit** — pre-qualified for savers
- **SBI SimplyCLICK Card** — high spend pattern detected

---

## Demo Flow

1. Click **Get Started** — Finn begins onboarding
2. Answer 6-8 questions naturally (or use quick reply chips)
3. Watch the **Financial Twin dashboard populate in real time**
4. See **Proactive Alerts** fire automatically based on your profile
5. Check **Recommendations** — personalized SBI products with "why this" explanation
6. Try the **Simulator** — drag the slider and watch health score change
7. Open **Budget** tab — pie chart + goal timeline calculator with allocation slider
8. Open **Where to Invest** — options ranked by your risk appetite
---

*"We didn't build a chatbot. We built a financial co-pilot that knows you better than a branch manager who's met you 10 times."*