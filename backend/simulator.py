import time
import random
import urllib.request
import json
from datetime import datetime

API_URL = "http://127.0.0.1:8000/api/ingest"

USERS = [
    "Harsha Vardhan (Chairman)",
    "Rahul Sharma",
    "Priya Patel",
    "David Miller",
    "Sarah Jenkins",
    "Vikram Reddy",
    "Elena Rostova",
    "Alex Rivera",
    "Ananya Sen"
]

COUNTRIES = ["United States", "India", "Germany", "United Kingdom", "Russia", "China", "Brazil", "Japan"]
IPS_NORMAL = ["192.168.1.45", "10.0.0.12", "172.16.0.5", "104.28.14.88", "49.207.54.12"]
IPS_SUSPICIOUS = ["185.220.101.5", "45.154.255.88", "193.56.29.14", "91.240.118.172", "103.251.170.2"]
ENDPOINTS = ["/api/v1/auth/login", "/api/v1/user/profile", "/api/v1/admin/config", "/api/v1/data/export", "/v2/auth/token"]

def generate_event():
    roll = random.random()
    hour = datetime.now().hour
    off_hours = 1 if hour in [0, 1, 2, 3, 4, 5] else 0

    if roll < 0.70:
        # Normal Activity
        return {
            "event_type": random.choice(["Login Success", "API Access", "Token Refresh"]),
            "source_ip": random.choice(IPS_NORMAL),
            "country": random.choice(["United States", "India", "Germany", "United Kingdom"]),
            "username": random.choice(["harsh", "alex_dev", "sarah_m"]),
            "endpoint": random.choice(ENDPOINTS[:3]),
            "port": 443,
            "login_attempts_1m": random.randint(1, 3),
            "failed_logins": 0,
            "geo_distance_km": round(random.uniform(2.0, 50.0), 1),
            "unknown_device": False,
            "payload_kb": round(random.uniform(0.5, 4.0), 1),
            "off_hours": off_hours
        }
    elif roll < 0.88:
        # Suspicious Activity (e.g. repeated failed login or off-hours access)
        return {
            "event_type": random.choice(["Failed Login", "Privilege Escalation Attempt", "Unusual Endpoint Access"]),
            "source_ip": random.choice(IPS_SUSPICIOUS),
            "country": random.choice(["Russia", "China", "Brazil"]),
            "username": random.choice(["root", "admin", "guest"]),
            "endpoint": random.choice(ENDPOINTS[2:]),
            "port": random.choice([443, 8080, 8443]),
            "login_attempts_1m": random.randint(4, 9),
            "failed_logins": random.randint(2, 4),
            "geo_distance_km": round(random.uniform(800.0, 3500.0), 1),
            "unknown_device": True,
            "payload_kb": round(random.uniform(15.0, 80.0), 1),
            "off_hours": off_hours
        }
    else:
        # High Risk / Attack Burst
        return {
            "event_type": random.choice(["Brute Force Attack", "Impossible Travel Login", "Port Scan", "Data Exfiltration Attempt"]),
            "source_ip": random.choice(IPS_SUSPICIOUS),
            "country": random.choice(["Russia", "China", "Unknown"]),
            "username": "admin",
            "endpoint": "/api/v1/admin/config",
            "port": random.choice([22, 3389, 445]),
            "login_attempts_1m": random.randint(15, 50),
            "failed_logins": random.randint(8, 20),
            "geo_distance_km": round(random.uniform(6000.0, 11500.0), 1),
            "unknown_device": True,
            "payload_kb": round(random.uniform(250.0, 3500.0), 1),
            "off_hours": 1
        }

def start_simulation():
    print("=" * 60)
    print("  [START] SHADOW SECURITY TELEMETRY SIMULATOR RUNNING")
    print(f"  Target API: {API_URL}")
    print("  Streaming live events every 1.5 seconds...")
    print("=" * 60)

    count = 0
    while True:
        try:
            event = generate_event()
            data = json.dumps(event).encode("utf-8")
            req = urllib.request.Request(API_URL, data=data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req) as response:
                res = json.loads(response.read().decode("utf-8"))
                count += 1
                risk_lvl = res.get("risk_level")
                icon = "[NORMAL] " if risk_lvl == "Normal" else ("[SUSPIC] " if risk_lvl == "Suspicious" else "[DANGER] ")
                print(f"[{count:04d}] {icon} Event: {event['event_type']:<28} | IP: {event['source_ip']:<15} | Risk: {res.get('risk_score')}% ({risk_lvl})")
        except Exception as e:
            print(f"[WAIT] Simulator waiting for Shadow FastAPI server on {API_URL}... ({e})")
        
        time.sleep(1.5)

if __name__ == "__main__":
    start_simulation()

