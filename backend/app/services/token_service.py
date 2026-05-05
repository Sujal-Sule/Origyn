from app.core.database import db
from datetime import datetime
from fastapi import HTTPException
from bson import ObjectId

async def get_user_doc(user_id: str):
    user = await db["users"].find_one({"phone": user_id})
    if not user:
        try:
            user = await db["users"].find_one({"_id": ObjectId(user_id)})
        except:
            pass
    return user

async def get_balance(user_id: str):
    user = await get_user_doc(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # the auth_service set 'tokens: 0', but my script used 'token_balance'
    # let's check for both to be safe
    balance = user.get("token_balance", user.get("tokens", 0))
    return {"balance": balance}

async def get_history(user_id: str):
    user = await get_user_doc(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"history": user.get("token_history", [])}

async def redeem_tokens(user_id: str, amount: int, reason: str):
    user = await get_user_doc(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    balance = user.get("token_balance", user.get("tokens", 0))
    if amount > balance:
        raise HTTPException(status_code=400, detail="Insufficient token balance")
        
    await db["users"].update_one(
        {"_id": user["_id"]},
        {
            "$inc": {"token_balance": -amount, "tokens": -amount},
            "$push": {"token_history": {
                "amount": -amount,
                "reason": reason,
                "timestamp": datetime.utcnow()
            }}
        }
    )
    return {"status": "success", "redeemed": amount, "remaining_balance": balance - amount}
