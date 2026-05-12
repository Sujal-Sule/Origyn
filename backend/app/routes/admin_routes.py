from fastapi import APIRouter, Depends
from app.core.database import db
from app.core.security import get_current_user
from datetime import datetime, timedelta
from bson import ObjectId

router = APIRouter()


@router.get("/products/{product_id}/history")
async def get_product_history(product_id: str):
    events = await db["events"].find({"product_id": product_id}).sort("timestamp", 1).to_list(length=100)
    history = []
    has_fraud = False

    for e in events:
        gps_raw = e.get("gps", "")
        location = None
        if gps_raw:
            try:
                parts = [float(x.strip()) for x in gps_raw.split(",")]
                if len(parts) >= 2:
                    location = [parts[0], parts[1]]
            except Exception:
                pass

        ts = e.get("timestamp")
        ts_str = ts.isoformat() if isinstance(ts, datetime) else str(ts or "")

        user_id = e.get("stakeholder_id", "")
        user_name = "Unknown"
        if user_id:
            try:
                user = await db["users"].find_one({"_id": ObjectId(user_id)}, {"name": 1})
                if user:
                    user_name = user.get("name", user_name)
            except Exception:
                pass

        anomaly = e.get("anomaly_flag", False)
        if anomaly:
            has_fraud = True

        history.append({
            "stage": e.get("stage", "Unknown"),
            "location": location,
            "updated_by": user_name,
            "timestamp": ts_str,
            "temperature": e.get("temperature"),
            "anomaly_flag": anomaly,
            "gps": gps_raw,
            "blockchain_tx": e.get("blockchain_tx"),
        })

    return {"history": history, "has_fraud": has_fraud}


@router.get("/stats")
async def get_stats():
    total_products = await db["products"].count_documents({})
    active_shipments = await db["products"].count_documents({"current_stage": {"$in": ["DISTRIBUTION", "Distribution"]}})
    total_scans = await db["events"].count_documents({})
    fake_attempts = await db["alerts"].count_documents({"status": "active"})
    recalled = await db["products"].count_documents({"recalled": True})

    products = await db["products"].find({}, {"trust_score": 1}).to_list(length=None)
    avg_trust = round(sum(p.get("trust_score", 0) for p in products) / len(products), 1) if products else 0

    blockchain_txs = await db["events"].count_documents({"blockchain_tx": {"$exists": True, "$ne": None}})

    return {
        "total_products": total_products,
        "active_shipments": active_shipments,
        "fake_attempts": fake_attempts,
        "total_scans": total_scans,
        "avg_trust_score": avg_trust,
        "blockchain_txs": blockchain_txs,
        "recalled": recalled,
    }


@router.get("/alerts")
async def get_alerts():
    alerts = await db["alerts"].find({}).sort("created_at", -1).to_list(length=100)
    for a in alerts:
        a["_id"] = str(a["_id"])
        if isinstance(a.get("created_at"), datetime):
            a["created_at"] = a["created_at"].isoformat()
    return alerts


@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    from bson import ObjectId
    await db["alerts"].update_one({"_id": ObjectId(alert_id)}, {"$set": {"status": "resolved"}})
    return {"status": "resolved"}


@router.get("/users")
async def get_all_users():
    users = await db["users"].find({}, {"hashed_password": 0}).to_list(length=200)
    for u in users:
        u["_id"] = str(u["_id"])
    return users


@router.get("/activity")
async def get_activity():
    events = await db["events"].find({}).sort("timestamp", -1).to_list(length=30)
    alerts = await db["alerts"].find({}).sort("created_at", -1).to_list(length=20)

    feed = []
    for e in events:
        ts = e.get("timestamp")
        if isinstance(ts, datetime):
            ts_str = ts.isoformat()
        else:
            ts_str = str(ts)
        stage = e.get("stage", "Unknown")
        product_id = e.get("product_id", "")
        stakeholder = e.get("stakeholder_id", "")
        anomaly = e.get("anomaly_flag", False)

        if stage == "CREATED":
            evt_type = "registration"
            msg = f"Product {product_id} registered"
        elif anomaly:
            evt_type = "anomaly"
            msg = f"Anomaly detected on {product_id}"
        else:
            evt_type = "update"
            msg = f"Product {product_id} moved to {stage}"

        feed.append({"id": str(e["_id"]), "message": msg, "type": evt_type, "timestamp": ts_str})

    for a in alerts:
        ts = a.get("created_at")
        if isinstance(ts, datetime):
            ts_str = ts.isoformat()
        else:
            ts_str = str(ts)
        feed.append({
            "id": str(a["_id"]),
            "message": a.get("message", "Alert triggered"),
            "type": "anomaly" if a.get("status") == "active" else "update",
            "timestamp": ts_str,
        })

    feed.sort(key=lambda x: x["timestamp"], reverse=True)
    return feed[:25]


@router.get("/analytics")
async def get_analytics():
    now = datetime.utcnow()
    days = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        start = datetime(day.year, day.month, day.day)
        end = start + timedelta(days=1)
        scans = await db["events"].count_documents({"timestamp": {"$gte": start, "$lt": end}})
        anomalies = await db["events"].count_documents({"timestamp": {"$gte": start, "$lt": end}, "anomaly_flag": True})
        days.append({"day": day.strftime("%a"), "scans": scans, "anomalies": anomalies})

    products = await db["products"].find({}, {"trust_score": 1}).to_list(length=None)
    dist = {"90-100": 0, "80-89": 0, "70-79": 0, "60-69": 0, "<60": 0}
    for p in products:
        s = p.get("trust_score", 0)
        if s >= 90:
            dist["90-100"] += 1
        elif s >= 80:
            dist["80-89"] += 1
        elif s >= 70:
            dist["70-79"] += 1
        elif s >= 60:
            dist["60-69"] += 1
        else:
            dist["<60"] += 1

    trust_distribution = [{"range": k, "count": v} for k, v in dist.items()]

    alerts_by_type = {}
    async for a in db["alerts"].find({}):
        t = a.get("type", "unknown")
        alerts_by_type[t] = alerts_by_type.get(t, 0) + 1

    return {
        "scans_per_day": days,
        "trust_distribution": trust_distribution,
        "alerts_by_type": alerts_by_type,
    }


@router.get("/products")
async def get_all_products():
    products = await db["products"].find({}).sort("created_at", -1).to_list(length=200)
    result = []
    for p in products:
        p["_id"] = str(p["_id"])
        if isinstance(p.get("created_at"), datetime):
            p["created_at"] = p["created_at"].isoformat()
        result.append(p)
    return result


@router.get("/products/{product_id}/events")
async def get_product_events(product_id: str):
    events = await db["events"].find({"product_id": product_id}).sort("timestamp", 1).to_list(length=100)
    for e in events:
        e["_id"] = str(e["_id"])
        if isinstance(e.get("timestamp"), datetime):
            e["timestamp"] = e["timestamp"].isoformat()
    return events


@router.post("/products/{product_id}/recall")
async def recall_product(product_id: str, user_id: str = Depends(get_current_user)):
    await db["products"].update_one(
        {"product_id": product_id},
        {"$set": {"recalled": True, "current_stage": "RECALLED"}}
    )
    alert = {
        "type": "RECALL",
        "severity": "CRITICAL",
        "message": f"Product {product_id} has been recalled",
        "product_id": product_id,
        "status": "active",
        "created_at": datetime.utcnow()
    }
    await db["alerts"].insert_one(alert)
    return {"status": "recalled", "product_id": product_id}


@router.get("/tokens/overview")
async def get_token_overview():
    users_cursor = db["users"].find({}, {"tokens": 1, "token_balance": 1, "token_history": 1, "name": 1})
    total_issued = 0
    total_spent = 0
    leaderboard = []

    async for u in users_cursor:
        bal = u.get("token_balance", u.get("tokens", 0))
        history = u.get("token_history", [])
        earned = sum(h["amount"] for h in history if h["amount"] > 0)
        spent = sum(abs(h["amount"]) for h in history if h["amount"] < 0)
        total_issued += earned
        total_spent += spent
        if earned > 0 or bal > 0:
            leaderboard.append({
                "name": u.get("name", "Unknown"),
                "tokens": bal,
                "earned": earned,
            })

    leaderboard.sort(key=lambda x: x["tokens"], reverse=True)

    return {
        "total_issued": total_issued,
        "total_spent": total_spent,
        "leaderboard": leaderboard[:10],
    }
