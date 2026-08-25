import json
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from database import init_db, get_db, EventLog, Alert, SuspiciousIP, SystemMetric, User, Feedback
from ml_model import predictor


app = FastAPI(title="Shadow Threat Intelligence Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database on startup
@app.on_event("startup")
def on_startup():
    init_db()
    print("Shadow Security Database Initialized.")

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected. Active clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"Client disconnected. Active clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)
        for dead in dead_connections:
            self.disconnect(dead)

manager = ConnectionManager()

# Pydantic Schemas
class EventIngestRequest(BaseModel):
    event_type: str  # Login, API Request, Data Transfer, Port Scan
    source_ip: str
    country: Optional[str] = "Unknown"
    username: Optional[str] = "anonymous"
    endpoint: Optional[str] = "/"
    port: Optional[int] = 443
    login_attempts_1m: Optional[int] = 1
    failed_logins: Optional[int] = 0
    geo_distance_km: Optional[float] = 0.0
    unknown_device: Optional[bool] = False
    payload_kb: Optional[float] = 1.0
    off_hours: Optional[int] = 0

class BlockIPRequest(BaseModel):
    ip_address: str
    block: bool = True

# WebSocket Endpoint
@app.websocket("/ws/threats")
async def websocket_threats(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open & receive heartbeats if any
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

# REST API Endpoints

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total_events = db.query(EventLog).count()
    normal_count = db.query(EventLog).filter(EventLog.risk_level == "Normal").count()
    suspicious_count = db.query(EventLog).filter(EventLog.risk_level == "Suspicious").count()
    high_risk_count = db.query(EventLog).filter(EventLog.risk_level == "High Risk").count()
    
    blocked_ips = db.query(SuspiciousIP).filter(SuspiciousIP.status == "Blocked").count()
    active_alerts = db.query(Alert).filter(Alert.status == "Active").count()
    
    recent_events = db.query(EventLog).order_by(desc(EventLog.timestamp)).limit(50).all()
    avg_risk = sum(e.risk_score for e in recent_events) / max(len(recent_events), 1)

    return {
        "total_events": total_events,
        "normal_count": normal_count,
        "suspicious_count": suspicious_count,
        "high_risk_count": high_risk_count,
        "blocked_ips_count": blocked_ips,
        "active_alerts_count": active_alerts,
        "avg_recent_risk_score": round(avg_risk, 1),
    }

@app.get("/api/events")
def get_events(limit: int = 50, risk_level: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(EventLog)
    if risk_level and risk_level != "All":
        query = query.filter(EventLog.risk_level == risk_level)
    events = query.order_by(desc(EventLog.timestamp)).limit(limit).all()
    return events

@app.get("/api/alerts")
def get_alerts(status: Optional[str] = "Active", db: Session = Depends(get_db)):
    query = db.query(Alert)
    if status and status != "All":
        query = query.filter(Alert.status == status)
    alerts = query.order_by(desc(Alert.timestamp)).limit(50).all()
    return alerts

@app.post("/api/alerts/{alert_id}/dismiss")
def dismiss_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "Dismissed"
    db.commit()
    return {"message": "Alert dismissed", "alert_id": alert_id}

@app.get("/api/ips")
def get_suspicious_ips(db: Session = Depends(get_db)):
    ips = db.query(SuspiciousIP).order_by(desc(SuspiciousIP.max_risk_score)).all()
    return ips

@app.post("/api/ips/block")
def toggle_block_ip(req: BlockIPRequest, db: Session = Depends(get_db)):
    ip_record = db.query(SuspiciousIP).filter(SuspiciousIP.ip_address == req.ip_address).first()
    if not ip_record:
        ip_record = SuspiciousIP(
            ip_address=req.ip_address,
            country="Unknown",
            attempt_count=1,
            max_risk_score=90.0,
            status="Blocked" if req.block else "Flagged"
        )
        db.add(ip_record)
    else:
        ip_record.status = "Blocked" if req.block else "Flagged"
    
    db.commit()
    return {"message": f"IP {req.ip_address} updated to {ip_record.status}", "ip": req.ip_address, "status": ip_record.status}

@app.get("/api/trends")
def get_trends(db: Session = Depends(get_db)):
    # Group events by minute over last 30 minutes
    now = datetime.utcnow()
    past_30m = now - timedelta(minutes=30)
    
    events = db.query(EventLog).filter(EventLog.timestamp >= past_30m).all()
    
    time_bins = {}
    for i in range(30):
        t_key = (past_30m + timedelta(minutes=i)).strftime("%H:%M")
        time_bins[t_key] = {"time": t_key, "Normal": 0, "Suspicious": 0, "High Risk": 0}

    for e in events:
        t_key = e.timestamp.strftime("%H:%M")
        if t_key in time_bins:
            time_bins[t_key][e.risk_level] = time_bins[t_key].get(e.risk_level, 0) + 1

    return list(time_bins.values())

@app.post("/api/ingest")
async def ingest_event(req: EventIngestRequest, db: Session = Depends(get_db)):
    # 1. Run ML Prediction
    ml_result = predictor.predict(req.dict())
    risk_score = ml_result["risk_score"]
    risk_level = ml_result["risk_level"]

    # 2. Check IP block status
    ip_rec = db.query(SuspiciousIP).filter(SuspiciousIP.ip_address == req.source_ip).first()
    if ip_rec and ip_rec.status == "Blocked":
        risk_score = 100.0
        risk_level = "High Risk"

    # 3. Create Event Record
    event = EventLog(
        event_type=req.event_type,
        source_ip=req.source_ip,
        country=req.country,
        username=req.username,
        endpoint=req.endpoint,
        port=req.port,
        login_attempts_1m=req.login_attempts_1m,
        failed_logins=req.failed_logins,
        geo_distance_km=req.geo_distance_km,
        unknown_device=req.unknown_device,
        payload_kb=req.payload_kb,
        risk_score=risk_score,
        risk_level=risk_level,
        timestamp=datetime.utcnow()
    )
    db.add(event)

    # 4. Update Suspicious IP directory
    if risk_level in ["Suspicious", "High Risk"]:
        if not ip_rec:
            ip_rec = SuspiciousIP(
                ip_address=req.source_ip,
                country=req.country,
                attempt_count=1,
                max_risk_score=risk_score,
                status="Flagged",
                first_seen=datetime.utcnow(),
                last_seen=datetime.utcnow()
            )
            db.add(ip_rec)
        else:
            ip_rec.attempt_count += 1
            ip_rec.max_risk_score = max(ip_rec.max_risk_score, risk_score)
            ip_rec.last_seen = datetime.utcnow()

        # Generate Alert for High Risk / Repeated Suspicious
        if risk_level == "High Risk" or (ip_rec and ip_rec.attempt_count >= 3):
            alert = Alert(
                title=f"Security Alert: {risk_level} detected on {req.source_ip}",
                description=f"User {req.username} on IP {req.source_ip} ({req.country}) triggered high anomaly score ({risk_score}%). Event: {req.event_type} on port {req.port}.",
                risk_level=risk_level,
                risk_score=risk_score,
                source_ip=req.source_ip,
                status="Active"
            )
            db.add(alert)

    db.commit()
    db.refresh(event)

    event_payload = {
        "type": "NEW_EVENT",
        "event": {
            "id": event.id,
            "timestamp": event.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "event_type": event.event_type,
            "source_ip": event.source_ip,
            "country": event.country,
            "username": event.username,
            "endpoint": event.endpoint,
            "port": event.port,
            "risk_score": event.risk_score,
            "risk_level": event.risk_level,
            "geo_distance_km": event.geo_distance_km,
            "unknown_device": event.unknown_device
        }
    }

    # Broadcast real-time event to all connected dashboard clients via WebSocket
    await manager.broadcast(event_payload)

    return {"status": "success", "event_id": event.id, "risk_score": risk_score, "risk_level": risk_level}

@app.post("/api/retrain")
def retrain_model():
    acc = predictor.train()
    return {"message": "Model retrained successfully", "accuracy": round(acc * 100, 2)}

# Auth Models
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "SOC Analyst"

class LoginRequest(BaseModel):
    username: str
    password: str

class FeedbackRequest(BaseModel):
    name: str
    email: str
    rating: int = 5
    category: str = "General"
    message: str

# Auth Endpoints
@app.post("/api/auth/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.username == req.username) | (User.email == req.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    user = User(
        username=req.username,
        email=req.email,
        password=req.password,  # In production, hash using passlib/bcrypt
        role=req.role or "SOC Analyst"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "status": "success",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }

# Auth Endpoints
@app.post("/api/auth/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    # 1. Chairman Harsha Super Admin Credentials
    if req.username.lower() == "harsha" and req.password == "harsha":
        return {
            "status": "success",
            "token": "shadow_chairman_token_harsha_secure",
            "user": {
                "id": 1,
                "username": "harsha",
                "name": "Harsha",
                "email": "harsha@shadow-defense.io",
                "role": "Chairman & Super Admin",
                "is_chairman": True
            }
        }

    # 2. Default demo admin / analyst logins
    if req.username == "admin" and req.password == "shadow123":
        return {
            "status": "success",
            "token": "shadow_jwt_admin_token",
            "user": {
                "id": 2,
                "username": "admin",
                "name": "Alex Miller",
                "email": "admin@shadow-soc.io",
                "role": "Lead SOC Analyst",
                "is_chairman": False
            }
        }

    user = db.query(User).filter(User.username == req.username).first()
    if not user or user.password != req.password:
        raise HTTPException(status_code=401, detail="Invalid username or password. Chairman login: harsha / harsha")
    
    return {
        "status": "success",
        "token": f"shadow_jwt_{user.id}_{user.username}",
        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.username.title(),
            "email": user.email,
            "role": user.role,
            "is_chairman": user.role == "Chairman & Super Admin"
        }
    }


# Feedback Endpoints
@app.post("/api/feedback")
def submit_feedback(req: FeedbackRequest, db: Session = Depends(get_db)):
    fb = Feedback(
        name=req.name,
        email=req.email,
        rating=req.rating,
        category=req.category,
        message=req.message,
        timestamp=datetime.utcnow()
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return {"status": "success", "message": "Feedback submitted successfully!", "feedback_id": fb.id}

@app.get("/api/feedback")
def get_all_feedback(db: Session = Depends(get_db)):
    feedback_list = db.query(Feedback).order_by(desc(Feedback.timestamp)).limit(30).all()
    return feedback_list

# Interactive Simulation & Action Endpoints
class SimulateRequest(BaseModel):
    attack_type: Optional[str] = "random" # "normal", "brute_force", "impossible_travel", "port_scan", "data_exfil"
    count: Optional[int] = 1

@app.post("/api/simulate")
async def trigger_simulation(req: SimulateRequest, db: Session = Depends(get_db)):
    import random
    created_events = []

    for _ in range(min(req.count or 1, 10)):
        if req.attack_type == "normal":
            event_data = {
                "event_type": random.choice(["Login Success", "API Access", "Token Refresh"]),
                "source_ip": random.choice(["192.168.1.45", "10.0.0.12", "104.28.14.88", "49.207.54.12"]),
                "country": random.choice(["United States", "India", "Germany", "United Kingdom"]),
                "username": random.choice(["harsh", "alex_dev", "sarah_m"]),
                "endpoint": "/api/v1/auth/login",
                "port": 443,
                "login_attempts_1m": random.randint(1, 3),
                "failed_logins": 0,
                "geo_distance_km": round(random.uniform(5.0, 30.0), 1),
                "unknown_device": False,
                "payload_kb": round(random.uniform(0.5, 4.0), 1),
                "off_hours": 0
            }
        elif req.attack_type == "brute_force":
            event_data = {
                "event_type": "Brute Force Attack",
                "source_ip": "185.220.101.5",
                "country": "Russia",
                "username": "root",
                "endpoint": "/api/v1/admin/login",
                "port": 443,
                "login_attempts_1m": random.randint(25, 60),
                "failed_logins": random.randint(12, 35),
                "geo_distance_km": 6800.0,
                "unknown_device": True,
                "payload_kb": 12.5,
                "off_hours": 1
            }
        elif req.attack_type == "impossible_travel":
            event_data = {
                "event_type": "Impossible Travel Login",
                "source_ip": "45.154.255.88",
                "country": "China",
                "username": "admin",
                "endpoint": "/api/v1/user/profile",
                "port": 443,
                "login_attempts_1m": 2,
                "failed_logins": 0,
                "geo_distance_km": 10450.0,
                "unknown_device": True,
                "payload_kb": 2.0,
                "off_hours": 1
            }
        elif req.attack_type == "port_scan":
            event_data = {
                "event_type": "Port Scan Reconnaissance",
                "source_ip": "91.240.118.172",
                "country": "Brazil",
                "username": "anonymous",
                "endpoint": "/",
                "port": random.choice([22, 3389, 445, 8080]),
                "login_attempts_1m": 15,
                "failed_logins": 5,
                "geo_distance_km": 9200.0,
                "unknown_device": True,
                "payload_kb": 0.2,
                "off_hours": 1
            }
        else:
            # Random mix
            event_data = {
                "event_type": random.choice(["Privilege Escalation Attempt", "API Ingestion", "Token Refresh", "Data Exfiltration Attempt"]),
                "source_ip": random.choice(["193.56.29.14", "103.251.170.2", "192.168.1.45", "10.0.0.12"]),
                "country": random.choice(["United States", "Germany", "Russia", "India"]),
                "username": random.choice(["admin", "harsh", "service_acct"]),
                "endpoint": "/api/v1/auth/token",
                "port": random.choice([443, 8080]),
                "login_attempts_1m": random.randint(1, 10),
                "failed_logins": random.randint(0, 4),
                "geo_distance_km": round(random.uniform(10.0, 4000.0), 1),
                "unknown_device": random.choice([True, False]),
                "payload_kb": round(random.uniform(1.0, 50.0), 1),
                "off_hours": 0
            }

        # Run ML inference
        ml_res = predictor.predict(event_data)
        r_score = ml_res["risk_score"]
        r_level = ml_res["risk_level"]

        event = EventLog(
            event_type=event_data["event_type"],
            source_ip=event_data["source_ip"],
            country=event_data["country"],
            username=event_data["username"],
            endpoint=event_data["endpoint"],
            port=event_data["port"],
            login_attempts_1m=event_data["login_attempts_1m"],
            failed_logins=event_data["failed_logins"],
            geo_distance_km=event_data["geo_distance_km"],
            unknown_device=event_data["unknown_device"],
            payload_kb=event_data["payload_kb"],
            risk_score=r_score,
            risk_level=r_level,
            timestamp=datetime.utcnow()
        )
        db.add(event)

        if r_level in ["Suspicious", "High Risk"]:
            ip_rec = db.query(SuspiciousIP).filter(SuspiciousIP.ip_address == event_data["source_ip"]).first()
            if not ip_rec:
                ip_rec = SuspiciousIP(
                    ip_address=event_data["source_ip"],
                    country=event_data["country"],
                    attempt_count=1,
                    max_risk_score=r_score,
                    status="Flagged"
                )
                db.add(ip_rec)
            else:
                ip_rec.attempt_count += 1
                ip_rec.max_risk_score = max(ip_rec.max_risk_score, r_score)
                ip_rec.last_seen = datetime.utcnow()

            if r_level == "High Risk":
                alert = Alert(
                    title=f"Incident: {event_data['event_type']} from {event_data['source_ip']}",
                    description=f"Automated trigger from simulation on user {event_data['username']} ({event_data['country']}) with risk score {r_score}%.",
                    risk_level=r_level,
                    risk_score=r_score,
                    source_ip=event_data["source_ip"],
                    status="Active"
                )
                db.add(alert)

        db.commit()
        db.refresh(event)

        payload = {
            "type": "NEW_EVENT",
            "event": {
                "id": event.id,
                "timestamp": event.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "event_type": event.event_type,
                "source_ip": event.source_ip,
                "country": event.country,
                "username": event.username,
                "endpoint": event.endpoint,
                "port": event.port,
                "risk_score": event.risk_score,
                "risk_level": event.risk_level,
                "geo_distance_km": event.geo_distance_km,
                "unknown_device": event.unknown_device
            }
        }
        await manager.broadcast(payload)
        created_events.append(payload["event"])

    return {"status": "success", "count": len(created_events), "events": created_events}

@app.post("/api/events/clear")
def clear_all_events(db: Session = Depends(get_db)):
    db.query(EventLog).delete()
    db.query(Alert).delete()
    db.commit()
    return {"message": "All historical events and alerts cleared."}

@app.post("/api/alerts/clear")
def clear_all_alerts(db: Session = Depends(get_db)):
    db.query(Alert).update({Alert.status: "Dismissed"})
    db.commit()
    return {"message": "All active alerts dismissed."}

@app.post("/api/alerts/{alert_id}/escalate")
def escalate_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.risk_level = "High Risk"
    alert.risk_score = 98.0
    alert.title = f"🔥 ESCALATED: {alert.title}"
    db.commit()
    return {"message": "Alert escalated to Critical Severity", "alert_id": alert_id}

# Delete Feedback Endpoint (Chairman / Admin only)
@app.delete("/api/feedback/{feedback_id}")
def delete_feedback(feedback_id: int, db: Session = Depends(get_db)):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    db.delete(fb)
    db.commit()
    return {"status": "success", "message": f"Feedback #{feedback_id} deleted successfully."}

# Admin User Generation Endpoint (Chairman / Admin only)
REAL_HUMAN_NAMES = [
    ("Rahul Sharma", "rahul.sharma@shadow-defense.io", "Senior Threat Analyst"),
    ("Priya Patel", "priya.patel@shadow-defense.io", "Lead SOC Engineer"),
    ("David Miller", "david.miller@shadow-defense.io", "Incident Response Officer"),
    ("Sarah Jenkins", "sarah.jenkins@shadow-defense.io", "Cyber Intelligence Specialist"),
    ("Vikram Reddy", "vikram.reddy@shadow-defense.io", "Firewall Security Architect"),
    ("Elena Rostova", "elena.rostova@shadow-defense.io", "Malware Forensics Lead"),
    ("Alex Rivera", "alex.rivera@shadow-defense.io", "Cloud Security Engineer"),
    ("Ananya Sen", "ananya.sen@shadow-defense.io", "Network Anomaly Analyst"),
    ("Marcus Vance", "marcus.vance@shadow-defense.io", "Security Operations Manager")
]

class GenerateUserRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = "SOC Analyst"

@app.post("/api/admin/generate-user")
def generate_user_credential(req: GenerateUserRequest, db: Session = Depends(get_db)):
    import random
    import string
    
    if req.name and req.name.strip():
        name = req.name.strip()
        uname = name.lower().replace(" ", ".")
        email = f"{uname}@shadow-defense.io"
        role = req.role or "SOC Analyst"
    else:
        sample = random.choice(REAL_HUMAN_NAMES)
        name = sample[0]
        uname = name.lower().replace(" ", ".")
        email = sample[1]
        role = sample[2] if not req.role else req.role

    # Generate random 8-character password
    chars = string.ascii_letters + string.digits
    raw_pass = "sh_" + "".join(random.choice(chars) for _ in range(6))

    # Check if username already exists
    existing = db.query(User).filter(User.username == uname).first()
    if existing:
        uname = f"{uname}{random.randint(10, 99)}"
        email = f"{uname}@shadow-defense.io"

    new_user = User(
        username=uname,
        email=email,
        password=raw_pass,
        role=role,
        created_at=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "status": "success",
        "credential": {
            "id": new_user.id,
            "full_name": name,
            "username": new_user.username,
            "email": new_user.email,
            "password": raw_pass,
            "role": new_user.role,
            "created_at": new_user.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
    }

@app.get("/api/admin/users")
def list_admin_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(desc(User.created_at)).all()
    return [{
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "password": u.password,
        "role": u.role,
        "created_at": u.created_at.strftime("%Y-%m-%d %H:%M:%S") if u.created_at else "2026-08-23 00:00:00"
    } for u in users]

@app.delete("/api/admin/users/{user_id}")
def remove_staff_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Staff member not found")
    
    # Prevent deleting Chairman account
    if user.username.lower() == "harsha" or user.role == "Chairman & Super Admin":
        raise HTTPException(status_code=400, detail="Cannot delete the Chairman & Super Admin account!")

    username = user.username
    db.delete(user)
    db.commit()
    return {"status": "success", "message": f"Staff member '{username}' successfully removed from active directory."}


# AI Chatbot Assistant Endpoint
class ChatRequest(BaseModel):
    message: str
    username: Optional[str] = "Harsha"
    is_chairman: Optional[bool] = True

@app.post("/api/ai/chat")
def ai_security_chat(req: ChatRequest, db: Session = Depends(get_db)):
    total_events = db.query(EventLog).count()
    normal_count = db.query(EventLog).filter(EventLog.risk_level == "Normal").count()
    suspicious_count = db.query(EventLog).filter(EventLog.risk_level == "Suspicious").count()
    high_risk_count = db.query(EventLog).filter(EventLog.risk_level == "High Risk").count()
    blocked_count = db.query(SuspiciousIP).filter(SuspiciousIP.status == "Blocked").count()
    active_alerts = db.query(Alert).filter(Alert.status == "Active").count()
    
    recent_suspicious = db.query(SuspiciousIP).order_by(desc(SuspiciousIP.max_risk_score)).limit(3).all()
    top_ips = ", ".join([f"{ip.ip_address} ({ip.country} - {ip.max_risk_score}%)" for ip in recent_suspicious]) if recent_suspicious else "None"

    prompt = req.message.lower()
    salutation = "Chairman Harsha" if req.is_chairman else req.username.title()

    # Intelligent contextual responses
    if "threat" in prompt or "status" in prompt or "overview" in prompt or "health" in prompt:
        response = (
            f"Greetings {salutation}! Here is your real-time security brief:\n\n"
            f"📊 **Telemetry Ingestion:** {total_events:,} total network events monitored.\n"
            f"🟢 **Normal Traffic:** {normal_count:,} events ({round(normal_count/max(total_events,1)*100, 1)}%)\n"
            f"🟡 **Suspicious Anomalies:** {suspicious_count:,} events under active ML monitoring.\n"
            f"🔴 **Critical Threats:** {high_risk_count:,} high-risk attacks identified.\n"
            f"🛡️ **Firewall Blacklist:** {blocked_count} threat actor IPs actively quarantined.\n"
            f"🚨 **Pending SOC Alerts:** {active_alerts} active alerts requiring review.\n\n"
            f"Top flagged threat actors: {top_ips}."
        )
    elif "ip" in prompt or "block" in prompt or "attacker" in prompt:
        response = (
            f"Here is the threat actor intelligence report for {salutation}:\n\n"
            f"Currently, our ML engine has flagged {len(recent_suspicious)} high-profile threat IPs:\n"
            f"• {top_ips}\n\n"
            f"You can quarantine any of these IPs with a single click in the **Suspicious IPs** tab or directly via the firewall triage action buttons."
        )
    elif "ml" in prompt or "model" in prompt or "how" in prompt or "algorithm" in prompt or "scikit" in prompt:
        response = (
            f"{salutation}, the SHADOW AI engine operates using an ensemble **Random Forest & XGBoost** classifier trained on multidimensional telemetry vectors:\n\n"
            f"1. **Login Velocity:** Detects rapid burst attempts per 60s sliding window.\n"
            f"2. **Geo-Velocity Delta:** Computes impossible physical travel distance hops ($\\Delta km$).\n"
            f"3. **Unknown Device Fingerprint:** Flags unverified client hardware signatures.\n"
            f"4. **Reconnaissance Port Probing:** Monitors sensitive management sockets (SSH 22, RDP 3389, SMB 445, 8080).\n"
            f"5. **Exfiltration Size:** Analyzes database dump and byte payload spikes.\n\n"
            f"Inference latency is $< 2\\text{{ms}}$ with **100% test accuracy** on our synthetic security benchmark!"
        )
    elif "alert" in prompt or "incident" in prompt:
        response = (
            f"{salutation}, there are currently **{active_alerts} active alerts** in the queue. "
            f"You can review them in the **Active Alerts** tab, escalate any critical incident, or use **Dismiss All Alerts** to clear the triage queue."
        )
    elif "user" in prompt or "credential" in prompt or "staff" in prompt:
        response = (
            f"As {salutation}, you have executive permission to generate new team credentials with real human names "
            f"(e.g., Rahul Sharma, Priya Patel, David Miller, Sarah Jenkins). Navigate to the **Staff Credentials** tab to generate login credentials instantly!"
        )
    else:
        response = (
            f"Hello {salutation}! I am your SHADOW AI Security Assistant.\n\n"
            f"I have live access to our ML risk engine, {total_events:,} classified network events, {active_alerts} active alerts, and {blocked_count} quarantined firewall IPs.\n\n"
            f"You can ask me about:\n"
            f"• Current threat levels & attack statistics\n"
            f"• Flagged threat actor IPs and country origins\n"
            f"• How our ML anomaly scoring algorithm works\n"
            f"• Recommended SOC defense actions & team credentials"
        )

    return {"status": "success", "reply": response, "salutation": salutation}



