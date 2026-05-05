import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "origyn")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    POLYGON_RPC_URL: str = os.getenv("POLYGON_RPC_URL", "https://rpc-mumbai.maticvigil.com")
    PRIVATE_KEY: str = os.getenv("PRIVATE_KEY", "")

settings = Settings()
