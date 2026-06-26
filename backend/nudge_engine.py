from datetime import datetime

def generate_nudges(twin: dict) -> list:
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
    net_worth = twin.get("net_worth") or 0

    current_day = datetime.now().day
    current_month = datetime.now().strftime("%B")

    # ── NUDGE 1: Emergency fund critical ──
    if not is_student and monthly_expenses > 0:
        ef_months = savings / monthly_expenses if monthly_expenses > 0 else 0
        if ef_months < 2:
            nudges.append({
                "id": "emergency_critical",
                "type": "alert",
                "priority": "high",
                "title": "Emergency Fund Critical",
                "message": f"You have less than 2 months of expenses saved. Target is 3 months (₹{int(monthly_expenses * 3):,}). You need ₹{int(monthly_expenses * 3 - savings):,} more.",
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
            "message": f"Investing at the start of the month maximizes SIP returns through rupee cost averaging. Your investable surplus is ₹{int(monthly_savings):,}/month.",
            "cta": "Start SIP Now",
            "category": "investment"
        })

    # ── NUDGE 3: Low savings rate ──
    if income > 0 and not is_student:
        invest_rate = monthly_savings / income if income > 0 else 0
        if invest_rate < 0.10:
            nudges.append({
                "id": "low_investment",
                "type": "warning",
                "priority": "medium",
                "title": "Savings Rate Below 10%",
                "message": f"You're saving {invest_rate*100:.0f}% of income. Aim for at least 20%. A small increase of ₹{int(income * 0.10):,}/month makes a big difference over time.",
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
            "message": "₹500/month started at 20 becomes ₹15L+ by 45 at 12% returns. The earlier you start, the less you need to invest later.",
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

    # ── NUDGE 6: Retirement nudge for 25-35 ──
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

    # ── NUDGE 8: High spend → cashback card ──
    if variable > 0 and income > 0:
        spend_ratio = variable / income
        if spend_ratio > 0.30:
            nudges.append({
                "id": "high_spend_cashback",
                "type": "opportunity",
                "priority": "medium",
                "title": "Your Spending Pattern Qualifies for Cashback",
                "message": f"You spend ₹{int(variable):,}/month on variable expenses. SBI SimplyCLICK card gives 10x rewards on online spends — you could earn ₹{int(variable * 0.05):,}/month back.",
                "cta": "Apply for SBI Card",
                "category": "spend_optimization"
            })

    # ── NUDGE 9: High saver → premium banking ──
    if income > 0 and monthly_savings > 0:
        savings_rate = monthly_savings / income
        if savings_rate > 0.35:
            nudges.append({
                "id": "high_saver_upgrade",
                "type": "opportunity",
                "priority": "medium",
                "title": "Your Savings Rate Qualifies for Premium Banking",
                "message": f"Saving {int(savings_rate*100)}% of income puts you in top 10% of savers. You pre-qualify for SBI Wealth Management and higher FD rates.",
                "cta": "Explore SBI Wealth",
                "category": "product_upgrade"
            })

    # ── NUDGE 10: High net worth → diversify ──
    if net_worth > 500000:
        nudges.append({
            "id": "networth_invest",
            "type": "opportunity",
            "priority": "medium",
            "title": f"₹{int(net_worth/100000)}L Net Worth — Time to Diversify",
            "message": f"Keeping ₹{int(net_worth):,} all in savings means losing to inflation. Spread across FD, MF, and NPS for better risk-adjusted returns.",
            "cta": "View Investment Plan",
            "category": "investment"
        })

    # ── NUDGE 11: Good income, no investments → EMI opportunity ──
    if income > 75000 and investments == 0 and not is_student:
        nudges.append({
            "id": "emi_opportunity",
            "type": "opportunity",
            "priority": "low",
            "title": "Pre-Qualified: 0% EMI on Large Purchases",
            "message": f"With ₹{int(income):,}/month income, you pre-qualify for SBI Credit Card with 0% EMI at 1000+ merchants. Convert big purchases to easy installments.",
            "cta": "Check EMI Eligibility",
            "category": "credit"
        })

    # ── NUDGE 12: Young high saver → step-up SIP ──
    if not is_student and age and isinstance(age, int) and age < 30 and income > 0 and monthly_savings > income * 0.25:
        nudges.append({
            "id": "salary_growth",
            "type": "insight",
            "priority": "low",
            "title": "Automate Your Wealth as Income Grows",
            "message": "A ₹500 annual SIP top-up adds ₹3.2L extra to your corpus over 20 years. Set a step-up SIP now so raises automatically build wealth.",
            "cta": "Set Step-Up SIP",
            "category": "planning"
        })

    # Sort by priority
    priority_order = {"high": 0, "medium": 1, "low": 2}
    nudges.sort(key=lambda x: priority_order.get(x["priority"], 3))

    return nudges