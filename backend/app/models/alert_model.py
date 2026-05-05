from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId
from app.models.user_model import PyObjectId

class AlertDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    type: str
    severity: str
    product_id: str
    message: str
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
