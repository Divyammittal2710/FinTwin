# SBI Product catalog — maps financial gaps to real SBI products
# This is what makes it bank-specific and impressive to judges

PRODUCTS = {
    "emergency_fund": {
        "name": "SBI Savings Plus Account",
        "description": "Auto-sweep FD linked to savings. Earns up to 7.1% while staying liquid.",
        "cta": "Open Now",
        "color": "#ef4444",
        "icon": "🛡️"
    },
    "investment": {
        "name": "SBI Mutual Fund SIP",
        "description": "Start a SIP from ₹500/month. ELSS funds save tax under 80C too.",
        "cta": "Start SIP",
        "color": "#6366f1",
        "icon": "📈"
    },
    "insurance": {
        "name": "SBI Life eShield Next",
        "description": "Term insurance starting ₹490/month for ₹1Cr cover. 100% online.",
        "cta": "Get Covered",
        "color": "#f59e0b",
        "icon": "🔒"
    },
    "retirement": {
        "name": "SBI Pension Fund (NPS)",
        "description": "National Pension Scheme via SBI. Tax benefit + market-linked returns.",
        "cta": "Start NPS",
        "color": "#22c55e",
        "icon": "🏖️"
    }
}

def get_recommendations(gaps: list) -> list:
    """Maps detected gaps to SBI product recommendations."""
    recommendations = []
    for gap in gaps:
        gap_type = gap.get("type")
        if gap_type in PRODUCTS:
            product = PRODUCTS[gap_type].copy()
            product["gap_type"] = gap_type
            product["severity"] = gap.get("severity")
            product["gap_message"] = gap.get("message")
            recommendations.append(product)
    return recommendations