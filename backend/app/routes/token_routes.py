from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.services.token_service import get_balance, get_history, redeem_tokens
from app.schemas.token_schema import TokenRedeem

router = APIRouter()

@router.get("/balance")
async def fetch_balance(current_user: str = Depends(get_current_user)):
    return await get_balance(current_user)

@router.get("/history")
async def fetch_history(current_user: str = Depends(get_current_user)):
    return await get_history(current_user)

@router.post("/redeem")
async def process_redeem(data: TokenRedeem, current_user: str = Depends(get_current_user)):
    return await redeem_tokens(current_user, data.amount, data.reason)
