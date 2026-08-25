import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

MODEL_FILE = os.path.join(os.path.dirname(__file__), "shadow_model.pkl")

class ThreatPredictor:
    def __init__(self):
        self.model = None
        self.feature_names = [
            "login_attempts_1m",
            "failed_logins",
            "geo_distance_km",
            "unknown_device",
            "suspicious_port",
            "payload_kb",
            "off_hours",
        ]
        self.load_or_train()

    def generate_synthetic_data(self, n_samples=3000):
        np.random.seed(42)
        
        # 70% Normal, 20% Suspicious, 10% High Risk
        n_normal = int(n_samples * 0.70)
        n_suspicious = int(n_samples * 0.20)
        n_high_risk = n_samples - n_normal - n_suspicious

        # Normal activity
        normal_data = {
            "login_attempts_1m": np.random.randint(1, 4, n_normal),
            "failed_logins": np.random.choice([0, 1], size=n_normal, p=[0.9, 0.1]),
            "geo_distance_km": np.random.exponential(scale=15, size=n_normal),
            "unknown_device": np.random.choice([0, 1], size=n_normal, p=[0.95, 0.05]),
            "suspicious_port": np.random.choice([0, 1], size=n_normal, p=[0.98, 0.02]),
            "payload_kb": np.random.uniform(0.5, 10.0, n_normal),
            "off_hours": np.random.choice([0, 1], size=n_normal, p=[0.85, 0.15]),
            "label": [0] * n_normal  # 0: Normal
        }

        # Suspicious activity
        suspicious_data = {
            "login_attempts_1m": np.random.randint(4, 12, n_suspicious),
            "failed_logins": np.random.randint(2, 5, n_suspicious),
            "geo_distance_km": np.random.uniform(100, 1500, n_suspicious),
            "unknown_device": np.random.choice([0, 1], size=n_suspicious, p=[0.4, 0.6]),
            "suspicious_port": np.random.choice([0, 1], size=n_suspicious, p=[0.7, 0.3]),
            "payload_kb": np.random.uniform(10.0, 150.0, n_suspicious),
            "off_hours": np.random.choice([0, 1], size=n_suspicious, p=[0.5, 0.5]),
            "label": [1] * n_suspicious  # 1: Suspicious
        }

        # High Risk / Attack activity
        high_risk_data = {
            "login_attempts_1m": np.random.randint(12, 60, n_high_risk),
            "failed_logins": np.random.randint(5, 25, n_high_risk),
            "geo_distance_km": np.random.uniform(1500, 12000, n_high_risk),
            "unknown_device": np.random.choice([0, 1], size=n_high_risk, p=[0.1, 0.9]),
            "suspicious_port": np.random.choice([0, 1], size=n_high_risk, p=[0.2, 0.8]),
            "payload_kb": np.random.uniform(150.0, 5000.0, n_high_risk),
            "off_hours": np.random.choice([0, 1], size=n_high_risk, p=[0.2, 0.8]),
            "label": [2] * n_high_risk  # 2: High Risk
        }

        df_normal = pd.DataFrame(normal_data)
        df_suspicious = pd.DataFrame(suspicious_data)
        df_high_risk = pd.DataFrame(high_risk_data)

        df = pd.concat([df_normal, df_suspicious, df_high_risk], ignore_index=True)
        return df.sample(frac=1.0, random_state=42).reset_index(drop=True)

    def train(self):
        df = self.generate_synthetic_data()
        X = df[self.feature_names]
        y = df["label"]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

        self.model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        print(f"Shadow ML Threat Classifier Trained successfully! Accuracy: {acc * 100:.2f}%")

        joblib.dump(self.model, MODEL_FILE)
        return acc

    def load_or_train(self):
        if os.path.exists(MODEL_FILE):
            try:
                self.model = joblib.load(MODEL_FILE)
                print("Loaded Shadow ML Model from disk.")
                return
            except Exception as e:
                print(f"Error loading model: {e}. Retraining...")
        self.train()

    def predict(self, event_features: dict):
        if self.model is None:
            self.load_or_train()

        # Format input vector
        input_data = pd.DataFrame([{
            "login_attempts_1m": float(event_features.get("login_attempts_1m", 1)),
            "failed_logins": float(event_features.get("failed_logins", 0)),
            "geo_distance_km": float(event_features.get("geo_distance_km", 0.0)),
            "unknown_device": 1.0 if event_features.get("unknown_device", False) else 0.0,
            "suspicious_port": 1.0 if event_features.get("port", 443) in [22, 3389, 445, 8080, 21, 23] else 0.0,
            "payload_kb": float(event_features.get("payload_kb", 1.0)),
            "off_hours": float(event_features.get("off_hours", 0)),
        }])

        probs = self.model.predict_proba(input_data)[0]
        # Class probabilities: [P(Normal), P(Suspicious), P(High Risk)]
        
        # Calculate continuous risk score (0 to 100)
        risk_score = (probs[1] * 50.0) + (probs[2] * 100.0)
        
        # Heuristic rules to boost sensitivity for severe threats
        if event_features.get("failed_logins", 0) > 10 or event_features.get("login_attempts_1m", 1) > 25:
            risk_score = max(risk_score, 85.0)
        elif event_features.get("geo_distance_km", 0) > 5000:
            risk_score = max(risk_score, 70.0)

        risk_score = round(min(100.0, max(0.0, risk_score)), 1)

        if risk_score < 35.0:
            risk_level = "Normal"
        elif risk_score < 70.0:
            risk_level = "Suspicious"
        else:
            risk_level = "High Risk"

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "probabilities": {
                "normal": round(float(probs[0]), 3),
                "suspicious": round(float(probs[1]), 3),
                "high_risk": round(float(probs[2]), 3),
            }
        }

# Global singleton
predictor = ThreatPredictor()
