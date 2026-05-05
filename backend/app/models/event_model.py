from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.models.user_model import PyObjectId

class EventDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    product_id: str
    stakeholder_id: str
    stage: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    gps: Optional[str] = None
    temp: Optional[float] = None
    prev_hash: str
    new_hash: str
    anomaly_flag: bool = False

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
