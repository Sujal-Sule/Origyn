from pydantic import BaseModel

class AlertCreate(BaseModel):
    type: str
    severity: str
    product_id: str
    message: str
