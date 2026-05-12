from fastapi import APIRouter, HTTPException, Depends
from app.schemas.product_schema import ProductCreate, ProductUpdate
from app.services.product_service import register_product, update_product_stage, get_product, get_user_products
from app.core.security import get_current_user

router = APIRouter()

@router.post("/register")
async def create_new_product(prod: ProductCreate, user_id: str = Depends(get_current_user)):
    return await register_product(prod, user_id)

@router.get("/my-products")
async def fetch_user_products(user_id: str = Depends(get_current_user)):
    products = await get_user_products(user_id)
    # Convert ObjectIDs to strings
    for p in products:
        p["_id"] = str(p["_id"])
    return products

@router.post("/{product_id}/update")
async def update_stage(product_id: str, update_data: ProductUpdate, user_id: str = Depends(get_current_user)):
    res = await update_product_stage(product_id, update_data, user_id)
    if not res:
        raise HTTPException(status_code=404, detail="Product not found")
    return res

@router.get("/{product_id}")
async def fetch_product(product_id: str):
    return await get_product(product_id)
