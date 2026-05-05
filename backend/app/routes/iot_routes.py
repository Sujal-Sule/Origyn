from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager
import asyncio
import random
from datetime import datetime

router = APIRouter()

@router.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await manager.connect(websocket, "alerts")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "alerts")

@router.websocket("/ws/iot")
async def websocket_iot(websocket: WebSocket):
    await manager.connect(websocket, "iot")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "iot")

@router.post("/simulate")
async def simulate_iot():
    temp = round(random.uniform(-5.0, 15.0), 2)
    lat = round(random.uniform(18.0, 20.0), 4)
    lon = round(random.uniform(72.0, 74.0), 4)
    current_time = str(datetime.utcnow())
    data = {
        "type": "IOT_DATA",
        "temperature": temp,
        "gps": f"{lat},{lon}",
        "timestamp": current_time
    }
    await manager.broadcast(data, "iot")
    return data
