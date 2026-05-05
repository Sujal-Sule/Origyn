from pydantic import BaseModel
from typing import Optional

class VerifyScan(BaseModel):
    qr_data: str

class ConsumerScan(BaseModel):
    qr_data: str
    gps: Optional[str] = None
