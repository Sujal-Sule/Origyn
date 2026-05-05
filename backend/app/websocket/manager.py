from fastapi import WebSocket
from typing import List, Dict

class ConnectionManager:
    def __init__(self):
        self.connections: Dict[str, List[WebSocket]] = {
            "alerts": [],
            "iot": []
        }

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel in self.connections:
            self.connections[channel].append(websocket)

    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.connections and websocket in self.connections[channel]:
            self.connections[channel].remove(websocket)

    async def broadcast(self, message: dict, channel: str):
        if channel in self.connections:
            for connection in self.connections[channel]:
                try:
                    await connection.send_json(message)
                except:
                    pass

manager = ConnectionManager()
