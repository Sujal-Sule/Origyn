import asyncio
import random
from app.websocket.manager import manager

async def simulate_iot_stream():
    while True:
        await asyncio.sleep(2)
        temp = round(random.uniform(2.0, 10.0), 2)
        lat = round(random.uniform(18.0, 20.0), 4)
        lon = round(random.uniform(72.0, 74.0), 4)
        data = {
            "type": "IOT_DATA",
            "temperature": temp,
            "gps": f"{lat},{lon}"
        }
        await manager.broadcast(data, "iot")
