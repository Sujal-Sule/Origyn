import os
import random
import string
import time

ACCOUNT_SID   = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN    = os.getenv("TWILIO_AUTH_TOKEN")
MESSAGING_SID = os.getenv("TWILIO_MESSAGING_SERVICE_SID")

try:
    from twilio.rest import Client as TwilioClient
    TWILIO_AVAILABLE = True
except ImportError:
    TwilioClient = None
    TWILIO_AVAILABLE = False
    print("[OTP] twilio package not installed — OTP will be printed to console only")

# In-memory OTP store: { phone: { otp, expires_at } }
_store: dict = {}

OTP_EXPIRY_SECONDS = 300  # 5 minutes


def _generate_otp(length: int = 6) -> str:
    return ''.join(random.choices(string.digits, k=length))


def _e164(phone: str) -> str:
    """Ensure phone is in E.164 format (+91XXXXXXXXXX for India)."""
    phone = phone.strip().replace(' ', '').replace('-', '')
    if phone.startswith('+'):
        return phone
    if len(phone) == 10:
        return f'+91{phone}'
    return f'+{phone}'


async def send_otp(phone: str) -> dict:
    otp = _generate_otp()
    expires_at = time.time() + OTP_EXPIRY_SECONDS
    _store[phone] = {'otp': otp, 'expires_at': expires_at}

    message = f"Your ORIGYN verification code is {otp}. Valid for 5 mins. Do not share this code."

    # Always print OTP to console for debugging/development
    print(f"\n[OTP] *** Phone: {phone}  OTP: {otp} ***\n")

    if TWILIO_AVAILABLE:
        try:
            client = TwilioClient(ACCOUNT_SID, AUTH_TOKEN)
            client.messages.create(
                messaging_service_sid=MESSAGING_SID,
                to=_e164(phone),
                body=message,
            )
            return {'success': True, 'message': 'OTP sent via SMS'}
        except Exception as e:
            _store.pop(phone, None)
            raise RuntimeError(f"Twilio error: {str(e)}")
    else:
        return {'success': True, 'message': 'OTP generated (check server console in dev mode)'}



async def verify_otp(phone: str, otp: str) -> bool:
    entry = _store.get(phone)
    if not entry:
        return False
    if time.time() > entry['expires_at']:
        _store.pop(phone, None)
        return False
    if entry['otp'] != otp.strip():
        return False
    _store.pop(phone, None)  # OTP is single-use
    return True
