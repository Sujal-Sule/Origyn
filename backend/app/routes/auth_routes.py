from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.auth_schema import UserCreate, UserLogin
from app.services.auth_service import create_user, authenticate_user

router = APIRouter()

@router.post("/register")
async def register(user: UserCreate):
    return await create_user(user)

@router.post("/login")
async def login(user: UserLogin):
    return await authenticate_user(user.phone, user.password)

@router.post("/token", include_in_schema=False)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    return await authenticate_user(form_data.username, form_data.password)
