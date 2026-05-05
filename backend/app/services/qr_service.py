import hashlib
import hmac
import base64
from io import BytesIO
import qrcode

def generate_dcqr(product_id: str, stage: str, prev_hash: str, timestamp: str, secret_key: str) -> str:
    message = f"{product_id}{stage}{prev_hash}{timestamp}".encode('utf-8')
    return hmac.new(secret_key.encode('utf-8'), message, hashlib.sha256).hexdigest()

def verify_dcqr(input_hash: str, stored_hash: str) -> bool:
    return hmac.compare_digest(input_hash, stored_hash)

def generate_qr_base64(payload: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"
