# The Nudge Engine — the "agentic" brain of FinTwin
# It looks at the twin's financial state and proactively fires alerts
# WITHOUT the user asking. This is what makes it agentic AI.

from datetime import datetime

def generate_nudges(twin: dict) -> list:
    """
    Analyzes the financial twin and returns proactive nudges.
    Each nudge is an insight the user didn't ask for but needs to see.
    """
    nudges = []
    
    life_stage = twin.get("life_stage") or ""
    income = twin.get("monthly_income") or 0
    savings = twin.get("savings_account") or 0
    investments = twin.get("investments") or 0
    monthly_savings = twin.get("monthly_savings") or 0
    health_score = twin.get("health_score") or 0
    fixed = twin.get("fixed_expenses") or 0
    variable = twin.get("variable_expenses") or 0
    monthly_expenses = fixed + variable
    age = twin.get("age") or 0
    goals = twin.get("goals") or []
    is_student = life_stage == "student"
    
    # Get current month info for time-based nudges
    current_day = datetime.now().day
    current_month = datetime.now().strftime("%B")

    # ── NUDGE 1: Critical emergency fund ──
    if not is_student and monthly_expenses > 0:
        ef_months = savings / monthly_expenses if monthly_expenses > 0 else 0
        if ef_months < 1:
            nudges.append({
                "id": "emergency_critical",
                "type": "alert",
                "priority": "high",
                "title": "Emergency Fund Critical",
                "message": f"You have less than 1 month of expenses saved. One unexpected event could derail your finances. Start with ₹{int(monthly_expenses):,} as your first target.",
                "cta": "Open SBI Savings Plus",
                "category": "emergency"
            })
        elif ef_months < 3:
            nudges.append({
                "id": "emergency_low",
                "type": "warning",
                "priority": "medium",
                "title": "Emergency Fund Below Safe Level",
                "message": f"You have {ef_months:.1f} months of expenses saved. The recommended minimum is 3 months. You need ₹{int(monthly_expenses * 3 - savings):,} more.",
                "cta": "Automate Monthly Transfer",
                "category": "emergency"
            })

    # ── NUDGE 2: Salary credited — act now ──
    if income > 0 and current_day <= 10:
        nudges.append({
            "id": "salary_credited",
            "type": "opportunity",
            "priority": "medium",
            "title": f"Early {current_month} — Best Time to Invest",
            "message": f"Investing at the start of the month maximizes your SIP returns through rupee cost averaging. Your investable surplus is ₹{int(monthly_savings):,}/month.",
            "cta": "Start SIP Now",
            "category": "investment"
        })

    # ── NUDGE 3: Not investing enough ──
    if income > 0 and not is_student:
        invest_rate = monthly_savings / income if income > 0 else 0
        if invest_rate < 0.10:
            nudges.append({
                "id": "low_investment",
                "type": "warning",
                "priority": "medium",
                "title": "Savings Rate Below 10%",
                "message": f"You're saving {invest_rate*100:.0f}% of your income. Financial advisors recommend at least 20%. Small increase of ₹{int(income * 0.10):,}/month makes a big difference over time.",
                "cta": "See Impact in Simulator",
                "category": "investment"
            })

    # ── NUDGE 4: Student — start early ──
    if is_student and investments == 0:
        nudges.append({
            "id": "student_sip",
            "type": "opportunity",
            "priority": "low",
            "title": "Start Investing at 20 — Retire Earlier",
            "message": "₹500/month started at 20 becomes ₹15L+ by 45 at 12% returns. The earlier you start, the less you need to invest later. SBI Mutual Fund SIPs start at ₹500.",
            "cta": "Start ₹500 SIP",
            "category": "investment"
        })

    # ── NUDGE 5: No goals defined ──
    if len(goals) == 0 and twin.get("name"):
        nudges.append({
            "id": "no_goals",
            "type": "insight",
            "priority": "low",
            "title": "No Financial Goals Defined",
            "message": "People with written financial goals are 42% more likely to achieve them. Tell Finn your top financial goal and we'll build a plan around it.",
            "cta": "Define a Goal with Finn",
            "category": "planning"
        })

    # ── NUDGE 6: Age-based retirement nudge ──
    if age and isinstance(age, int) and 25 <= age <= 35 and not is_student:
        if investments < income * 3:
            nudges.append({
                "id": "retirement_early",
                "type": "insight",
                "priority": "low",
                "title": "Your 30s Are Your Most Powerful Investing Years",
                "message": f"Starting NPS now at {age} with ₹{int(income * 0.10):,}/month could build a corpus of ₹{int(income * 0.10 * 12 * (35 - age) * 2.5):,} by retirement.",
                "cta": "Open NPS Account",
                "category": "retirement"
            })

    # ── NUDGE 7: High expenses warning ──
    if income > 0 and monthly_expenses > income * 0.80:
        nudges.append({
            "id": "high_expenses",
            "type": "alert",
            "priority": "high",
            "title": "Expenses Consuming 80%+ of Income",
            "message": f"Your expenses are ₹{int(monthly_expenses):,} against income of ₹{int(income):,}. This leaves very little room for savings or emergencies.",
            "cta": "Review with Finn",
            "category": "budgeting"
        })

    # Sort by priority
    priority_order = {"high": 0, "medium": 1, "low": 2}
    nudges.sort(key=lambda x: priority_order.get(x["priority"], 3))

    return nudges