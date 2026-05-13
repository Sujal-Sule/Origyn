from app.core.database import db

async def calculate_trust_score(product: dict) -> dict:
    score = 100
    warnings = []

    if product.get("recalled", False):
        score -= 50
        warnings.append("Product has been recalled by the manufacturer.")

    if not product.get("blockchain_tx"):
        score -= 20
        warnings.append("Missing initial blockchain registration.")

    # Fetch history events to analyze the journey
    events = await db["events"].find({"product_id": product.get("product_id")}).sort("timestamp", 1).to_list(length=100)
    
    anomaly_count = sum(1 for e in events if e.get("anomaly_flag"))
    if anomaly_count > 0:
        score -= (15 * anomaly_count)
        warnings.append(f"Detected {anomaly_count} GPS or timing anomaly/anomalies during transit.")

    # Temperature checks
    temp_issues = 0
    for e in events:
        temp = e.get("temperature")
        if temp is not None:
            try:
                t = float(temp)
                if t > 35.0 or t < -5.0:
                    temp_issues += 1
            except (ValueError, TypeError):
                pass
                
    if temp_issues > 0:
        score -= (10 * temp_issues)
        warnings.append(f"Recorded {temp_issues} temperature reading(s) outside safe limits.")

    # Stage progression logic
    if product.get("current_stage") == "DELIVERED" and len(events) < 3:
        score -= 10
        warnings.append("Product was delivered with an unusually short tracking history.")

    # Ensure score is within 0-100 bounds
    score = max(0, min(100, score))

    grade = "A"
    if score >= 90:
        grade = "A"
    elif score >= 75:
        grade = "B"
    elif score >= 60:
        grade = "C"
    else:
        grade = "D"
        
    return {
        "score": score,
        "grade": grade,
        "warnings": warnings
    }
