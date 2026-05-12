from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from app.schemas.auth_schema import UserCreate, UserLogin
from app.services.auth_service import create_user, authenticate_user, get_user_by_id, reset_user_password
from app.services.otp_service import send_otp, verify_otp
from app.core.security import get_current_user

router = APIRouter()


class OTPRequest(BaseModel):
    phone: str


class OTPVerify(BaseModel):
    phone: str
    otp: str

class ResetPasswordRequest(BaseModel):
    phone: str
    otp: str
    new_password: str

@router.post("/reset-password")
async def reset_password_endpoint(body: ResetPasswordRequest):
    # Verify OTP first
    ok = await verify_otp(body.phone, body.otp)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Update password
    return await reset_user_password(body.phone, body.new_password)

@router.post("/send-otp")
async def send_otp_endpoint(body: OTPRequest):
    try:
        result = await send_otp(body.phone)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-otp")
async def verify_otp_endpoint(body: OTPVerify):
    ok = await verify_otp(body.phone, body.otp)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    return {"verified": True}


@router.post("/register")
async def register(user: UserCreate):
    return await create_user(user)


@router.post("/login")
async def login(user: UserLogin):
    return await authenticate_user(user.phone, user.password)


@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user)):
    user = await get_user_by_id(user_id)
    return user


@router.post("/token", include_in_schema=False)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    return await authenticate_user(form_data.username, form_data.password)
