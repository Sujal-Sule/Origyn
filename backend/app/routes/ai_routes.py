from fastapi import APIRouter

router = APIRouter()

@router.post("/verify-image")
async def verify_image_route():
    return {"verified": True}
