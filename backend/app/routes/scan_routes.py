from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.schemas.scan_schema import ConsumerScan, VerifyScan
from app.services.scan_service import process_consumer_scan, verify_scan

router = APIRouter()

@router.post("/verify")
async def verify_qr(data: VerifyScan):
    return await verify_scan(data.qr_data)

@router.post("/consumer")
async def consumer_scan(data: ConsumerScan, current_user: str = Depends(get_current_user)):
    return await process_consumer_scan(current_user, data.dict())
