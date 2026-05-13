from app.core.database import db
from datetime import datetime
from bson import ObjectId  # type: ignore
from app.services.trust_score_service import calculate_trust_score

async def verify_scan(qr_data: str):
    parts = qr_data.split(":")
    if len(parts) != 2:
        return {"valid": False, "message": "Invalid QR format"}
        
    product_id, scanned_hash = parts[0], parts[1]
    
    prod = await db["products"].find_one({"product_id": product_id})
    if not prod:
        return {"valid": False, "message": "Product not found"}
        
    if prod.get("current_dcqr_hash") != scanned_hash:
        return {"valid": False, "message": "Fake or outdated QR"}
        
    prod.pop("_id", None)
    return {"valid": True, "product": prod}

async def process_consumer_scan(user_id: str, data: dict):
    qr_data = data.get("qr_data", "")
    verify_result = await verify_scan(qr_data)
    
    if not verify_result["valid"]:
        return {
            "valid": False, 
            "message": verify_result["message"], 
            "tokens_earned": 0, 
            "total_balance": 0
        }
        
    prod = verify_result["product"]
    product_id = prod["product_id"]
    
    user = await db["users"].find_one({"phone": user_id})
    if not user:
        try:
            user = await db["users"].find_one({"_id": ObjectId(user_id)})
        except:
            pass
            
    actual_user_id = user["_id"] if user else user_id
        
    existing_scan = await db["scans"].find_one({"user_id": actual_user_id, "product_id": product_id})
    
    tokens_earned = 0
    if not existing_scan and user:
        tokens_earned = 5
        await db["users"].update_one(
            {"_id": actual_user_id},
            {
                "$inc": {"token_balance": tokens_earned, "tokens": tokens_earned},
                "$push": {"token_history": {
                    "amount": tokens_earned,
                    "reason": f"Scanned {prod.get('name', 'Product')}",
                    "product_id": product_id,
                    "timestamp": datetime.utcnow()
                }}
            }
        )
        await db["scans"].insert_one({
            "user_id": actual_user_id,
            "product_id": product_id,
            "timestamp": datetime.utcnow(),
            "gps": data.get("gps")
        })
        
    user = await db["users"].find_one({"_id": actual_user_id}) if user else None
    total_balance = user.get("token_balance", user.get("tokens", 0)) if user else 0
    
    trust_score_data = await calculate_trust_score(prod)
    
    return {
        "valid": True,
        "product": prod,
        "trust_score": trust_score_data,
        "tokens_earned": tokens_earned,
        "total_balance": total_balance
    }
