DEFAULT_TWIN = {
    "name": None,
    "age": None,
    "life_stage": None,
    "monthly_income": None,
    "fixed_expenses": None,
    "variable_expenses": None,
    "savings_account": None,
    "investments": None,
    "risk_appetite": None,
    "goals": [],
    "loans": [],
    "dependents": 0,
    "monthly_savings": None,
    "net_worth": None,
    "emergency_fund_months": None,
    "health_score": None,
    "gaps": []
}

def update_twin(current_twin: dict, extracted: dict) -> dict:
    updated = current_twin.copy()
    for key, value in extracted.items():
        if value is not None and value != "":
            if key == "age":
                try:
                    if isinstance(value, str) and "-" in value:
                        value = int(value.split("-")[0])
                    else:
                        value = int(value)
                except:
                    continue
            if key in ["monthly_income", "fixed_expenses", "variable_expenses", "savings_account", "investments"]:
                try:
                    value = int(value)
                except:
                    continue
            updated[key] = value
    updated = compute_metrics(updated)
    return updated


def compute_metrics(twin: dict) -> dict:
    income = twin.get("monthly_income") or 0
    fixed = twin.get("fixed_expenses") or 0
    variable = twin.get("variable_expenses") or 0
    savings = twin.get("savings_account") or 0
    investments = twin.get("investments") or 0

    twin["monthly_savings"] = income - fixed - variable if income else twin.get("monthly_savings")
    twin["net_worth"] = savings + investments

    monthly_expenses = fixed + variable
    if monthly_expenses > 0 and savings > 0:
        twin["emergency_fund_months"] = round(savings / monthly_expenses, 1)
    else:
        twin["emergency_fund_months"] = None

    twin["gaps"] = compute_gaps(twin)
    twin["health_score"] = compute_health_score(twin)

    return twin


def compute_gaps(twin: dict) -> list:
    gaps = []
    life_stage = twin.get("life_stage") or ""
    income = twin.get("monthly_income") or 0
    savings = twin.get("savings_account") or 0
    investments = twin.get("investments") or 0
    age = twin.get("age")
    monthly_expenses = (twin.get("fixed_expenses") or 0) + (twin.get("variable_expenses") or 0)
    monthly_savings = twin.get("monthly_savings") or 0
    is_student = life_stage == "student"

    if is_student:
        if savings < 10000:
            gaps.append({
                "type": "emergency_fund",
                "severity": "medium",
                "message": "Start a small emergency buffer of at least ₹10,000",
                "gap_amount": 10000 - savings
            })
        if investments == 0:
            gaps.append({
                "type": "investment",
                "severity": "low",
                "message": "Consider starting a SIP from as low as ₹500/month to build the habit early",
                "gap_amount": 500
            })
        return gaps

    # Working professional gaps
    if monthly_expenses > 0:
        required_emergency = monthly_expenses * 3
        if savings < required_emergency:
            gaps.append({
                "type": "emergency_fund",
                "severity": "high" if savings < monthly_expenses * 2 else "medium",
                "message": f"Emergency fund short by ₹{required_emergency - savings:,} (need 3 months of expenses)",
                "gap_amount": required_emergency - savings
            })

    if income > 0 and monthly_savings < income * 0.20:
        gaps.append({
            "type": "investment",
            "severity": "medium",
            "message": f"Investing ₹{int(income * 0.20 - monthly_savings):,} more/month would hit the 20% savings benchmark",
            "gap_amount": int(income * 0.20 - monthly_savings)
        })

    if age and isinstance(age, int) and age > 25 and investments < 100000:
        gaps.append({
            "type": "insurance",
            "severity": "medium",
            "message": "No term insurance detected — recommended for anyone with dependents or loans",
            "gap_amount": None
        })

    return gaps


def compute_health_score(twin: dict) -> int:
    life_stage = twin.get("life_stage") or ""
    income = twin.get("monthly_income") or 0
    monthly_savings = twin.get("monthly_savings") or 0
    savings = twin.get("savings_account") or 0
    investments = twin.get("investments") or 0
    goals = twin.get("goals") or []
    is_student = life_stage == "student"

    score = 0

    if is_student:
        # Savings buffer (50 pts) — graduated scale
        if savings >= 50000:
            score += 50
        elif savings >= 25000:
            score += 40
        elif savings >= 10000:
            score += 30
        elif savings >= 5000:
            score += 20
        elif savings >= 2000:
            score += 10
        elif savings > 0:
            score += 5

        # Investments (30 pts)
        if investments >= 10000:
            score += 30
        elif investments > 0:
            score += 15

        # Goals defined (20 pts)
        if len(goals) > 0:
            score += 20

        return min(score, 100)

    # Working professional scoring
    ef_months = twin.get("emergency_fund_months") or 0
    if ef_months >= 6:
        score += 30
    elif ef_months >= 3:
        score += 20
    elif ef_months >= 1:
        score += 10

    if income > 0:
        savings_rate = monthly_savings / income
        if savings_rate >= 0.30:
            score += 30
        elif savings_rate >= 0.20:
            score += 20
        elif savings_rate >= 0.10:
            score += 10

    if investments >= 100000:
        score += 20
    elif investments > 0:
        score += 10

    if len(goals) > 0:
        score += 20

    return min(score, 100)