import os
import httpx

async def upload_to_ipfs(file_bytes: bytes, filename: str) -> str:
    pinata_api_key = os.getenv("PINATA_API_KEY")
    pinata_secret_api_key = os.getenv("PINATA_SECRET_API_KEY")
    
    if not pinata_api_key or not pinata_secret_api_key:
        return "Qm_mock_hash_no_pinata_keys"
        
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    headers = {
        "pinata_api_key": pinata_api_key,
        "pinata_secret_api_key": pinata_secret_api_key
    }
    
    files = {"file": (filename, file_bytes)}
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(url, headers=headers, files=files, timeout=30.0)
            res.raise_for_status()
            return res.json().get("IpfsHash")
        except Exception as e:
            print("Pinata IPFS Error:", e)
            return "Qm_upload_error"
