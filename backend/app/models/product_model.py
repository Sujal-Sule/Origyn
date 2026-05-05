from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.models.user_model import PyObjectId

class ProductDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    product_id: str
    name: str
    category: str
    creator_id: str
    batch_size: int
    current_stage: str
    current_dcqr_hash: str
    ipfs_hashes: List[str] = []
    blockchain_tx: Optional[str] = None
    trust_score: float = 100.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expiry: Optional[datetime] = None
    recalled: bool = False

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
