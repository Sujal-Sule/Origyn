from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductCreate(BaseModel):
    name: str
    category: str
    batch_size: int
    image: Optional[str] = None
    gps: Optional[str] = None

class ProductUpdate(BaseModel):
    new_stage: str
    gps: str
    temperature: Optional[float] = None
    timestamp: datetime
