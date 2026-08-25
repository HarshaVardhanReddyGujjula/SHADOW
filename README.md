# SHADOW — Real-Time ML Threat Intelligence & Network Anomaly Platform

**SHADOW** is a modern full-stack cybersecurity intelligence platform that monitors login and network activity telemetry in real time. Powered by **Scikit-Learn / XGBoost**, SHADOW calculates dynamic risk scores (0–100%) and classifies incoming activity as **Normal**, **Suspicious**, or **High Risk**.

---

## ⚡ Key Features

- **Real-Time Telemetry Streaming:** Bi-directional FastAPI WebSockets feed incoming network telemetry live to connected client dashboards.
- **Machine Learning Risk Engine:** Scikit-Learn Random Forest / XGBoost model predicting anomaly risk based on login velocity, geo-distance jump, unknown device fingerprint, suspicious ports, and payload size.
- **Interactive SOC React Dashboard:**
  - **Threat Overview:** Top KPI metrics, attack trend time-series charts (Recharts), and ML risk distribution pie charts.
  - **Live Telemetry Feed:** Real-time event ticker with risk badges and geolocation anomaly warnings.
  - **Suspicious & Blocked IPs Directory:** Flagged IP list with instant **Block IP** and **Unblock** actions.
  - **Active SOC Alerts:** Real-time security alert cards with **Dismiss** capabilities.
  - **Incident Log Audit:** Searchable audit trail with text search and risk level filtering.
- **Telemetry Event Simulator:** Autonomous python worker simulating normal logins, brute-force attacks, geo-teleportation logins, and port scans.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, WebSockets.
- **Backend:** Python 3.10+, FastAPI, Uvicorn, WebSockets, Pydantic.
- **ML Layer:** Scikit-Learn, XGBoost, Pandas, Numpy, Joblib.
- **Database:** SQLAlchemy ORM + SQLite (PostgreSQL compatible).
- **Deployment:** One-click `start.bat` launcher script + Docker & Docker Compose configuration.

---

## 🚀 Quick Start Instructions

### Option 1: Native Windows Setup (One-Click)

Simply double-click **`start.bat`** in `D:\shadow` or run:

```cmd
cd /d D:\shadow
start.bat
```

This will automatically create a Python virtual environment, install backend & frontend dependencies, start the FastAPI backend server, launch the event simulator, and open the React dashboard at **`http://localhost:5173`**.

---

### Option 2: Manual Terminal Execution

#### 1. Start FastAPI Backend
```cmd
cd /d D:\shadow\backend
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

#### 2. Start Event Simulator
In a second terminal:
```cmd
cd /d D:\shadow\backend
venv\Scripts\activate.bat
python simulator.py
```

#### 3. Start React Dashboard
In a third terminal:
```cmd
cd /d D:\shadow\frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** in your web browser.
