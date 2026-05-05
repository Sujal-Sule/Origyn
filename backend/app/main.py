from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth_routes, product_routes, scan_routes, admin_routes, blockchain_routes, ai_routes, iot_routes, token_routes
import asyncio
from app.services.iot_service import simulate_iot_stream

app = FastAPI(title="Origyn Supply Chain Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(product_routes.router, prefix="/api/products", tags=["products"])
app.include_router(scan_routes.router, prefix="/api/scan", tags=["scans"])
app.include_router(admin_routes.router, prefix="/api/admin", tags=["admin"])
app.include_router(blockchain_routes.router, prefix="/api/blockchain", tags=["blockchain"])
app.include_router(ai_routes.router, prefix="/api/ai", tags=["ai"])
app.include_router(iot_routes.router, prefix="/api/iot", tags=["iot"])
app.include_router(token_routes.router, prefix="/api/tokens", tags=["tokens"])

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulate_iot_stream())

@app.get("/")
def root():
    return {"message": "Welcome to Origyn API"}
