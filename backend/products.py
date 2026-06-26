PRODUCTS = {
    "emergency_fund": {
        "name": "SBI Savings Plus Account",
        "description": "Auto-sweep FD linked to savings. Idle money earns up to 7.1% FD rate while staying instantly withdrawable. Ideal for emergency corpus.",
        "cta": "Open Now",
        "color": "#ef4444",
        "icon": "🛡️",
        "why": "Your emergency fund is below 3 months. This account grows your buffer passively.",
        "steps": ["Open via YONO SBI", "Enable auto-sweep above ₹25,000", "Set standing instruction for monthly top-up"]
    },
    "investment": {
        "name": "SBI Mutual Fund SIP",
        "description": "Start a SIP from ₹500/month in index funds or ELSS. ELSS saves up to ₹46,800 in taxes annually under Section 80C. Historically 12-15% CAGR.",
        "cta": "Start SIP",
        "color": "#6366f1",
        "icon": "📈",
        "why": "You're not investing 20% of your income yet. SIPs build wealth through compounding.",
        "steps": ["Choose index fund (low cost)", "Set SIP date = salary credit date", "Increase by 10% every year"]
    },
    "insurance": {
        "name": "SBI Life eShield Next",
        "description": "Pure term insurance — ₹1Cr cover from ₹490/month. No investment component, maximum protection. Claim settlement ratio 97.05%.",
        "cta": "Get Covered",
        "color": "#f59e0b",
        "icon": "🔒",
        "why": "No term insurance detected. Anyone with dependents or loans needs this.",
        "steps": ["Choose cover = 15x annual income", "Select 30-year term", "Add critical illness rider"]
    },
    "retirement": {
        "name": "NPS via SBI Pension Fund",
        "description": "National Pension Scheme — market-linked returns with additional ₹50,000 tax deduction under 80CCD(1B) over and above 80C limit.",
        "cta": "Open NPS",
        "color": "#22c55e",
        "icon": "🏖️",
        "why": "Your retirement corpus is underfunded for your age and income.",
        "steps": ["Open Tier 1 NPS account", "Choose aggressive allocation (75% equity) if under 35", "Set ₹5,000/month auto-debit"]
    },
    "tax": {
        "name": "SBI ELSS Tax Saver Fund",
        "description": "Save up to ₹46,800 in taxes while building wealth. 3-year lock-in — shortest among 80C options. Average 14% returns over 10 years.",
        "cta": "Save Tax Now",
        "color": "#8b5cf6",
        "icon": "📋",
        "why": "High income earners often miss ELSS — it's both tax saving and wealth creation.",
        "steps": ["Invest ₹1.5L before March 31", "Choose growth option", "Hold beyond 3 years for best returns"]
    },
    "fd": {
        "name": "SBI Fixed Deposit",
        "description": "Guaranteed 7.1% returns for senior citizens, 6.8% for others. DICGC insured up to ₹5L. Ideal for short-term goals 1-3 years away.",
        "cta": "Book FD",
        "color": "#06b6d4",
        "icon": "🏦",
        "why": "Stable, guaranteed returns for money you'll need within 3 years.",
        "steps": ["Choose tenure matching your goal", "Enable auto-renewal", "Consider FD ladder for liquidity"]
    }
}

INVESTMENT_GUIDE = {
    "conservative": [
        {"option": "SBI Fixed Deposit", "returns": "6.8-7.1%", "risk": "None", "horizon": "1-5 years", "ideal_for": "Emergency fund top-up, short goals"},
        {"option": "SBI Liquid Fund", "returns": "6.5-7%", "risk": "Very Low", "horizon": "1 day - 3 months", "ideal_for": "Parking surplus money"},
        {"option": "PPF via SBI", "returns": "7.1%", "risk": "None", "horizon": "15 years", "ideal_for": "Long-term tax-free savings"},
    ],
    "moderate": [
        {"option": "SBI Balanced Advantage Fund", "returns": "10-12%", "risk": "Medium", "horizon": "3-5 years", "ideal_for": "Medium-term goals"},
        {"option": "SBI Blue Chip Fund (SIP)", "returns": "12-14%", "risk": "Medium", "horizon": "5+ years", "ideal_for": "Wealth creation"},
        {"option": "NPS (60% equity)", "returns": "10-11%", "risk": "Medium", "horizon": "Till retirement", "ideal_for": "Retirement + tax saving"},
    ],
    "aggressive": [
        {"option": "SBI Small Cap Fund", "returns": "15-18%", "risk": "High", "horizon": "7+ years", "ideal_for": "Long-term wealth creation"},
        {"option": "SBI Nifty Index Fund", "returns": "12-15%", "risk": "Medium-High", "horizon": "5+ years", "ideal_for": "Low-cost market returns"},
        {"option": "SBI ELSS Tax Saver", "returns": "13-15%", "risk": "Medium-High", "horizon": "3+ years", "ideal_for": "Tax saving + growth"},
    ]
}


def get_recommendations(gaps: list, twin: dict = None) -> list:
    recommendations = []
    twin = twin or {}
    income = twin.get("monthly_income") or 0
    risk = twin.get("risk_appetite") or "moderate"
    age = twin.get("age") or 25

    for gap in gaps:
        gap_type = gap.get("type")
        if gap_type in PRODUCTS:
            product = PRODUCTS[gap_type].copy()
            product["gap_type"] = gap_type
            product["severity"] = gap.get("severity")
            product["gap_message"] = gap.get("message")

            # Personalize based on profile
            if gap_type == "investment" and income > 0:
                monthly_invest = int(income * 0.20)
                product["description"] = f"Start a SIP of ₹{monthly_invest:,}/month (20% of income). At 12% CAGR, this becomes ₹{int(monthly_invest * 12 * 10 * 1.8):,} in 10 years. ELSS option also saves ₹{min(monthly_invest * 12, 150000) * 30 // 100:,} in taxes."

            if gap_type == "insurance" and income > 0:
                cover = income * 12 * 15
                product["description"] = f"Based on your income, you need ₹{cover/100000:.0f}L term cover. SBI Life eShield costs ~₹{int(cover/100000 * 50)}/month. Claim settlement ratio: 97.05%."

            recommendations.append(product)

    # Tax saving for high income
    if income > 50000 and not any(g.get("type") == "tax" for g in gaps):
        product = PRODUCTS["tax"].copy()
        product["gap_type"] = "tax"
        product["severity"] = "medium"
        product["gap_message"] = f"At ₹{income:,}/month income, you can save ₹{min(int(income * 12 * 0.30), 46800):,} in taxes annually"
        recommendations.append(product)

    # Pre-qualified FD for anyone with good savings
    if twin.get("savings_account", 0) > 100000:
        product = PRODUCTS["fd"].copy()
        product["gap_type"] = "fd"
        product["severity"] = "low"
        product["gap_message"] = f"You have ₹{twin.get('savings_account', 0):,} in savings — a portion in FD earns guaranteed 6.8% vs ~3.5% in savings account"
        product["name"] = "Pre-Qualified: SBI Fixed Deposit"
        recommendations.append(product)

    return recommendations


def get_investment_guide(risk_appetite: str) -> list:
    risk = risk_appetite.lower() if risk_appetite else "moderate"
    if risk not in INVESTMENT_GUIDE:
        risk = "moderate"
    return INVESTMENT_GUIDE[risk]