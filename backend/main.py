from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llm_service import chat_and_extract
from twin_engine import DEFAULT_TWIN, update_twin, compute_metrics
from products import get_recommendations
from nudge_engine import generate_nudges
import copy

app = FastAPI(title="FinTwin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions = {}

class ChatMessage(BaseModel):
    session_id: str
    message: str

class ScenarioRequest(BaseModel):
    session_id: str
    extra_monthly_savings: int = 0
    extra_investments: int = 0

@app.get("/health")
def health_check():
    return {"status": "FinTwin backend is alive", "version": "1.0"}

@app.post("/chat")
def chat(payload: ChatMessage):
    session_id = payload.session_id
    user_message = payload.message

    if session_id not in sessions:
        sessions[session_id] = {
            "history": [],
            "twin": copy.deepcopy(DEFAULT_TWIN)
        }

    session = sessions[session_id]
    session["history"].append({"role": "user", "content": user_message})

    result = chat_and_extract(session["history"])

    session["history"].append({"role": "assistant", "content": result.get("message", "")})

    if result.get("extracted"):
        session["twin"] = update_twin(session["twin"], result["extracted"])

    return {
        "message": result.get("message", ""),
        "quick_replies": result.get("quick_replies", []),
        "twin": session["twin"]
    }

@app.get("/twin/{session_id}")
def get_twin(session_id: str):
    if session_id not in sessions:
        return {"twin": copy.deepcopy(DEFAULT_TWIN)}
    return {"twin": sessions[session_id]["twin"]}

@app.get("/recommendations/{session_id}")
def get_product_recommendations(session_id: str):
    if session_id not in sessions:
        return {"recommendations": []}
    twin = sessions[session_id]["twin"]
    gaps = twin.get("gaps", [])
    return {"recommendations": get_recommendations(gaps)}

@app.post("/scenario")
def run_scenario(payload: ScenarioRequest):
    if payload.session_id not in sessions:
        return {"error": "Session not found"}

    simulated = copy.deepcopy(sessions[payload.session_id]["twin"])

    # Simulate 12 months of extra saving — more realistic projection
    extra_annual = payload.extra_monthly_savings * 12
    simulated["savings_account"] = (simulated.get("savings_account") or 0) + extra_annual
    simulated["monthly_savings"] = (simulated.get("monthly_savings") or 0) + payload.extra_monthly_savings

    # If student with no income, treat extra savings as their income
    if not simulated.get("monthly_income"):
        simulated["monthly_income"] = payload.extra_monthly_savings

    simulated = compute_metrics(simulated)

    return {
        "original_score": sessions[payload.session_id]["twin"]["health_score"],
        "simulated_score": simulated["health_score"],
        "simulated_twin": simulated
    }

@app.get("/nudges/{session_id}")
def get_nudges(session_id: str):
    """
    Proactively generates nudges from the current twin state.
    This is the agentic layer — fires without user asking.
    """
    if session_id not in sessions:
        return {"nudges": []}
    twin = sessions[session_id]["twin"]
    nudges = generate_nudges(twin)
    return {"nudges": nudges}