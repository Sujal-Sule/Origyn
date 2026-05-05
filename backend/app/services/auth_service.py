from app.core.database import db
from app.core.security import get_password_hash, verify_password, create_access_token
from fastapi import HTTPException
import uuid

async def create_user(user_data):
    existing = await db["users"].find_one({"phone": user_data.phone})
    if existing:
        raise HTTPException(status_code=400, detail="User already registered")
    
    hashed = get_password_hash(user_data.password)
    new_user = {
        "name": user_data.name,
        "phone": user_data.phone,
        "role": user_data.role,
        "wallet_address": f"0x{uuid.uuid4().hex[:40]}",
        "reputation": 100,
        "tokens": 0,
        "hashed_password": hashed
    }
    await db["users"].insert_one(new_user)
    return {"msg": "User created successfully"}

async def authenticate_user(phone, password):
    user = await db["users"].find_one({"phone": phone})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if not verify_password(password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = create_access_token({"sub": str(user["_id"])})
    return {"access_token": token, "token_type": "bearer"}
