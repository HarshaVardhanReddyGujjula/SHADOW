# 🛡️ SHADOW — Real-Time AI Threat Intelligence & SOAR Platform

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Access_SHADOW_Web_App-blue?style=for-the-badge&logo=githubpages&logoColor=white)](https://harshavardhanreddygujjula.github.io/SHADOW/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-SHADOW-181717?style=for-the-badge&logo=github)](https://github.com/HarshaVardhanReddyGujjula/SHADOW)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Scikit-Learn](https://img.shields.io/badge/ML_Engine-RandomForest_%26_XGBoost-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)

### **[👉 Click Here to Open Live Interactive Demo](https://harshavardhanreddygujjula.github.io/SHADOW/)**

</div>

---

## 🌟 Overview

**SHADOW** is a high-performance, real-time AI cybersecurity platform and Security Operations Center (SOC) dashboard. It ingests authentication and network telemetry packets, predicts multi-dimensional anomaly risk scores ($0\% - 100\%$) using **Random Forest & XGBoost** machine learning classifiers in $< 2\text{ms}$, and provides automated **SOAR (Security Orchestration, Automation & Response)** containment.

---

## 🚀 Live Demo Quick Login

You can test the live application directly in your browser:
👉 **[https://harshavardhanreddygujjula.github.io/SHADOW/](https://harshavardhanreddygujjula.github.io/SHADOW/)**

| Role | Username | Password | Privileges |
| :--- | :--- | :--- | :--- |
| 👑 **Chairman & Super Admin** | `harsha` | `harsha` | **Full Executive Access**, Delete Feedback, Generate/Remove Staff Logins |
| 🛡️ **Lead SOC Analyst** | `admin` | `shadow123` | Real-time Telemetry, Triage Alerts, Firewall Quarantine |
| 🔍 **Security Analyst** | `analyst` | `shadow123` | Read-only Telemetry & Incident Inspection |

*(Or click the 1-Click Quick Login buttons on the Sign In screen!)*

---

## ⚡ Key Capabilities

* 🧠 **Real-Time ML Anomaly Scoring:** Evaluates login velocity bursts, impossible travel geo-hops ($\Delta km$), unknown device hashes, sensitive port probes (SSH 22, RDP 3389, SMB 445), and payload byte spikes.
* 🧪 **Interactive Attack Simulator Sandbox:** Inject live Brute Force bursts, Impossible Travel anomalies, and Port Scans with 1 click to watch live charts and ML classifiers react in real time.
* 🤖 **SHADOW AI Security Advisor:** Context-aware interactive chatbot grounded in live database state to provide telemetry analysis, threat intelligence, and executive briefings for Chairman Harsha.
* 🚫 **Instant Firewall Quarantine & SOAR:** 1-click IP quarantine, alert escalation, forced session token revocation, and CSV compliance export.
* 👥 **Staff Credentials Directory:** Executive tool for Chairman Harsha to 1-click generate and manage team credentials with realistic human names.

---

## 🏗️ Local Quickstart

### Prerequisites
* Python 3.10+
* Node.js 18+

### 1-Click Launch (Windows)
Double-click [`start.bat`](file:///D:/shadow/start.bat) or run:
```powershell
cd D:\shadow
npm start
```

### URLs
* **Frontend SOC Dashboard:** [http://localhost:5173](http://localhost:5173)
* **FastAPI Swagger API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🏢 Enterprise Scaling Architecture (100k+ EPS)
For production enterprise scaling blueprints across **Apache Kafka**, **ClickHouse OLAP**, **Celery/Ray ML Workers**, and **Docker Compose Orchestration**, see:
👉 [`ENTERPRISE_SCALING_GUIDE.md`](./ENTERPRISE_SCALING_GUIDE.md) & [`docker-compose.enterprise.yml`](./docker-compose.enterprise.yml).

---

## 📜 License
MIT License &copy; 2026 Chairman Harsha & SHADOW Defense Engine.
