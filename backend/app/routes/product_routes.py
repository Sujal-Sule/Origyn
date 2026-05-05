from fastapi import APIRouter, HTTPException
from app.schemas.product_schema import ProductCreate, ProductUpdate
from app.services.product_service import register_product, update_product_stage, get_product

router = APIRouter()

@router.post("/register")
async def create_new_product(prod: ProductCreate):
    return await register_product(prod, "mock_user_id")

@router.post("/{product_id}/update")
async def update_stage(product_id: str, update_data: ProductUpdate):
    res = await update_product_stage(product_id, update_data, "mock_user_id")
    if not res:
        raise HTTPException(status_code=404, detail="Product not found")
    return res

@router.get("/{product_id}")
async def fetch_product(product_id: str):
    return await get_product(product_id)
