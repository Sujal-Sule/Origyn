from app.core.database import db
from app.services.qr_service import generate_dcqr, generate_qr_base64
from app.services.blockchain_service import register_product_on_chain, update_product_stage_on_chain
from app.services.ai_service import detect_gps_fraud
from app.services.ipfs_service import upload_to_ipfs
from app.websocket.manager import manager
from fastapi import HTTPException
import uuid
import time
import base64
from datetime import datetime
from app.core.config import settings

async def register_product(data, user_id):
    timestamp = str(int(time.time()))
    product_id = f"OR-{datetime.utcnow().year}-{str(uuid.uuid4().hex)[:5].upper()}"
    
    initial_qr = generate_dcqr(product_id, "CREATED", "genesis", timestamp, settings.SECRET_KEY)
    
    ipfs_hash = None
    if getattr(data, "image", None):
        try:
            base64_data = data.image.split(",")[1] if "," in data.image else data.image
            file_bytes = base64.b64decode(base64_data)
            ipfs_hash = await upload_to_ipfs(file_bytes, f"{product_id}.png")
        except Exception as e:
            print("IPFS decoding/upload error:", e)
            ipfs_hash = "Qm_upload_error"
            
    blockchain_data = f"REGISTER:{product_id}:IPFS:{ipfs_hash}" if ipfs_hash else f"REGISTER:{product_id}"
    tx_hash = await register_product_on_chain(product_id, blockchain_data)
    
    prod_dict = data.dict()
    prod_dict.update({
        "product_id": product_id,
        "creator_id": user_id,
        "current_stage": "CREATED",
        "current_dcqr_hash": initial_qr,
        "blockchain_tx": tx_hash,
        "ipfs_hash": ipfs_hash,
        "trust_score": 100.0,
        "recalled": False,
        "created_at": datetime.utcnow(),
        "last_updated": timestamp,
        "anomaly_flag": False
    })
    await db["products"].insert_one(prod_dict)
    
    event = {
        "product_id": product_id,
        "stakeholder_id": user_id,
        "stage": "CREATED",
        "timestamp": datetime.utcnow(),
        "gps": data.gps,
        "temperature": getattr(data, "temperature", None),
        "prev_hash": "genesis",
        "new_hash": initial_qr,
        "anomaly_flag": False,
        "blockchain_tx": tx_hash
    }
    await db["events"].insert_one(event)
    qr_payload = f"{product_id}:{initial_qr}"
    qr_image = generate_qr_base64(qr_payload)
    return {
        "product_id": product_id,
        "qr_hash": initial_qr,
        "qr_payload": qr_payload,
        "qr_image": qr_image,
        "ipfs_hash": ipfs_hash,
        "stage": "CREATED",
        "tx_hash": tx_hash
    }

async def update_product_stage(product_id: str, data, user_id):
    prod = await db["products"].find_one({"product_id": product_id})
    if not prod:
        return None
        
    if not data.timestamp:
        raise HTTPException(status_code=400, detail="Timestamp is missing")
        
    prev_events = await db["events"].find({"product_id": product_id}).sort("timestamp", -1).to_list(length=1)
    prev_event = prev_events[0] if prev_events else None
    
    timestamp_str = str(int(data.timestamp.timestamp()))
    new_qr = generate_dcqr(product_id, data.new_stage, prod["current_dcqr_hash"], timestamp_str, settings.SECRET_KEY)
    
    tx_hash = await update_product_stage_on_chain(product_id, data.new_stage)
    
    event_data_for_ai = {
        "stage": data.new_stage,
        "timestamp": data.timestamp,
        "gps": data.gps,
        "temperature": data.temperature
    }
    
    anomaly = await detect_gps_fraud(prev_event, event_data_for_ai)
    
    if anomaly:
        alert = {
            "type": "ALERT",
            "severity": "HIGH",
            "message": "GPS Fraud Detected",
            "product_id": product_id,
            "status": "active",
            "created_at": datetime.utcnow()
        }
        await db["alerts"].insert_one(alert)
        await manager.broadcast({
            "type": "ALERT",
            "severity": "HIGH",
            "message": "GPS Fraud Detected",
            "product_id": product_id
        }, "alerts")
        
    await db["products"].update_one(
        {"product_id": product_id},
        {"$set": {
            "current_stage": data.new_stage, 
            "current_dcqr_hash": new_qr, 
            "last_updated": timestamp_str, 
            "anomaly_flag": anomaly,
            "blockchain_tx": tx_hash
        }}
    )
    
    event = {
        "product_id": product_id,
        "stakeholder_id": user_id,
        "stage": data.new_stage,
        "timestamp": data.timestamp,
        "gps": data.gps,
        "temperature": data.temperature,
        "prev_hash": prod["current_dcqr_hash"],
        "new_hash": new_qr,
        "anomaly_flag": anomaly,
        "blockchain_tx": tx_hash
    }
    await db["events"].insert_one(event)
    
    qr_payload = f"{product_id}:{new_qr}"
    qr_image = generate_qr_base64(qr_payload)
    return {
        "status": "updated",
        "anomaly": anomaly,
        "message": "GPS Fraud Detected" if anomaly else "Stage updated successfully",
        "qr_hash": new_qr,
        "qr_payload": qr_payload,
        "qr_image": qr_image,
        "tx_hash": tx_hash
    }

async def get_product(product_id: str):
    return await db["products"].find_one({"product_id": product_id}, {"_id": 0})

async def get_user_products(user_id: str):
    from bson import ObjectId  # type: ignore
    # Find all product IDs where the user was a stakeholder in an event
    events = await db["events"].find({"stakeholder_id": user_id}).to_list(length=None)
    
    # Find all product IDs where the user has scanned it
    try:
        scans = await db["scans"].find({"user_id": ObjectId(user_id)}).to_list(length=None)
    except:
        scans = []
        
    product_ids_from_events = list(set([e["product_id"] for e in events] + [s["product_id"] for s in scans]))
    
    query = {
        "$or": [
            {"creator_id": user_id},
            {"product_id": {"$in": product_ids_from_events}}
        ]
    }
    return await db["products"].find(query).sort("created_at", -1).to_list(length=100)
