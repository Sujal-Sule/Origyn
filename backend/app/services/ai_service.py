from geopy.distance import geodesic
from app.utils.helpers import parse_timestamp

async def detect_gps_fraud(prev_event: dict, current_event: dict) -> bool:
    try:
        if not prev_event or not prev_event.get("gps") or not current_event.get("gps"):
            return False

        lat1, lon1 = map(float, prev_event["gps"].split(",")[:2])
        lat2, lon2 = map(float, current_event["gps"].split(",")[:2])

        t1 = parse_timestamp(prev_event["timestamp"])
        t2 = parse_timestamp(current_event["timestamp"])

        dist_km = geodesic((lat1, lon1), (lat2, lon2)).kilometers
        hours = abs((t2 - t1).total_seconds()) / 3600.0

        print("Parsed T1:", t1)
        print("Parsed T2:", t2)
        print("Distance:", dist_km)
        print("Time (hours):", hours)

        if hours == 0:
            print("Warning: Time difference is zero. Speed cannot be calculated.")
            speed = 0
        else:
            speed = dist_km / hours

        print("Speed:", speed)

        anomaly = speed > 150
        print("ANOMALY:", anomaly)

        return anomaly
    except Exception as e:
        print("Error in detect_gps_fraud:", e)
        return False
