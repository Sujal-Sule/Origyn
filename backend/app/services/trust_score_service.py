async def calculate_trust_score(product: dict) -> dict:
    score = 100
    warnings = []

    if product.get("anomaly_flag", False):
        score -= 15
        warnings.append("Anomaly detected in product lifecycle.")
        
    if product.get("recalled", False):
        score -= 50
        warnings.append("Product has been recalled.")

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
