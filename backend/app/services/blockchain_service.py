from web3 import Web3
import os
from dotenv import load_dotenv

load_dotenv()

w3 = Web3(Web3.HTTPProvider(os.getenv("POLYGON_RPC_URL")))

PRIVATE_KEY = os.getenv("PRIVATE_KEY")
try:
    if PRIVATE_KEY and PRIVATE_KEY.strip() not in ("", "0000000000000000000000000000000000000000000000000000000000000000"):
        ACCOUNT = w3.eth.account.from_key(PRIVATE_KEY.strip())
        WALLET_ADDRESS = ACCOUNT.address
    else:
        ACCOUNT = None
        WALLET_ADDRESS = None
except Exception as e:
    print(f"Warning: Invalid PRIVATE_KEY in .env, falling back to mock mode: {e}")
    ACCOUNT = None
    WALLET_ADDRESS = None

CHAIN_ID = int(os.getenv("CHAIN_ID", 80002))

def connect_to_blockchain():
    return w3.is_connected()

async def send_transaction(data: str) -> str:
    if not ACCOUNT:
        return "0x_mock_tx_hash_no_pk"
        
    try:
        nonce = w3.eth.get_transaction_count(WALLET_ADDRESS)

        tx = {
            "nonce": nonce,
            "to": WALLET_ADDRESS,
            "value": 0,
            "gas": 200000,
            "gasPrice": w3.to_wei("30", "gwei"),
            "chainId": CHAIN_ID,
            "data": w3.to_hex(text=data),
        }

        signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)

        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

        return w3.to_hex(tx_hash)

    except Exception as e:
        print(f"Blockchain error: {e}")
        return "0x_mock_tx_hash_error"

async def register_product_on_chain(product_id: str, data: dict) -> str:
    return await send_transaction(f"REGISTER:{product_id}")

async def update_product_stage_on_chain(product_id: str, stage: str) -> str:
    return await send_transaction(f"UPDATE:{product_id}:{stage}")

async def get_transaction(tx_hash: str):
    if tx_hash.startswith("0x_mock"):
        return {"tx_hash": tx_hash, "status": "mocked"}
    try:
        tx = w3.eth.get_transaction(tx_hash)
        return {"tx_hash": tx_hash, "status": "confirmed", "block": tx.blockNumber}
    except Exception:
        return {"tx_hash": tx_hash, "status": "not_found"}
