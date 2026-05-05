from fastapi import APIRouter

router = APIRouter()

@router.get("/tx/{tx_hash}")
async def get_transaction(tx_hash: str):
    return {"tx_hash": tx_hash, "status": "confirmed"}
