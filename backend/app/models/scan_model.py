from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId
from app.models.user_model import PyObjectId

class ScanDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    product_id: str
    user_id: str
    role: str
    location: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    trust_score: float
    tokens_awarded: int = 0

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
