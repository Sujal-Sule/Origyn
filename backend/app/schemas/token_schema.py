from pydantic import BaseModel

class TokenRedeem(BaseModel):
    amount: int
    reason: str
