import hashlib
import hmac
import time
from datetime import datetime

def generate_dcqr_hash(product_id: str, stage: str, prev_hash: str, secret: str) -> str:
    timestamp = str(int(time.time()))
    message = f"{product_id}{stage}{prev_hash}{timestamp}".encode('utf-8')
    return hmac.new(secret.encode('utf-8'), message, hashlib.sha256).hexdigest()

def parse_gps(gps_str: str) -> dict:
    if not gps_str:
        raise ValueError("GPS string cannot be empty")
    try:
        lat, lng = map(float, gps_str.split(","))
        return {
            "type": "Point",
            "coordinates": [lng, lat]
        }
    except Exception:
        raise ValueError("Invalid GPS format. Expected 'lat,lng'")

def parse_timestamp(ts):
    if isinstance(ts, str):
        if ts.endswith("Z"):
            ts = ts[:-1] + "+00:00"
        try:
            dt = datetime.fromisoformat(ts)
        except ValueError as e:
            raise ValueError(f"Failed to parse timestamp {ts}: {str(e)}")
    elif isinstance(ts, datetime):
        dt = ts
    else:
        raise ValueError(f"Invalid timestamp format: {type(ts)}")
        
    if dt.tzinfo is not None:
        from datetime import timezone
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt
