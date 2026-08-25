import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = os.path.join(os.path.dirname(__file__), "shadow_security.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class EventLog(Base):
    __tablename__ = "event_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    event_type = Column(String, index=True)  # Login, API Access, Data Transfer, Port Scan
    source_ip = Column(String, index=True)
    country = Column(String, default="Unknown")
    username = Column(String, index=True, default="anonymous")
    endpoint = Column(String, default="/")
    port = Column(Integer, default=443)
    login_attempts_1m = Column(Integer, default=1)
    failed_logins = Column(Integer, default=0)
    geo_distance_km = Column(Float, default=0.0)
    unknown_device = Column(Boolean, default=False)
    payload_kb = Column(Float, default=1.0)
    risk_score = Column(Float, default=0.0)  # 0.0 to 100.0
    risk_level = Column(String, default="Normal")  # Normal, Suspicious, High Risk

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    title = Column(String)
    description = Column(Text)
    risk_level = Column(String, default="Suspicious")
    risk_score = Column(Float, default=50.0)
    source_ip = Column(String, index=True)
    status = Column(String, default="Active")  # Active, Dismissed, Resolved

class SuspiciousIP(Base):
    __tablename__ = "suspicious_ips"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, unique=True, index=True)
    country = Column(String, default="Unknown")
    attempt_count = Column(Integer, default=1)
    max_risk_score = Column(Float, default=0.0)
    status = Column(String, default="Flagged")  # Flagged, Blocked, Whitelisted
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)

class SystemMetric(Base):
    __tablename__ = "system_metrics"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    total_events = Column(Integer, default=0)
    normal_count = Column(Integer, default=0)
    suspicious_count = Column(Integer, default=0)
    high_risk_count = Column(Integer, default=0)
    avg_risk_score = Column(Float, default=0.0)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="SOC Analyst")  # Lead SOC Analyst, Security Engineer, Admin
    created_at = Column(DateTime, default=datetime.utcnow)

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    name = Column(String)
    email = Column(String)
    rating = Column(Integer, default=5)
    category = Column(String, default="General")  # Bug Report, Feature Request, ML Accuracy, General
    message = Column(Text)



def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
