from pathlib import Path
from typing import Any

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier

from .features import extract_text_features, extract_url_features

MODEL_PATH = Path("app/models/phishing_url_model.joblib")
FEATURE_ORDER = [
    "url_length",
    "has_https",
    "dot_count",
    "hyphen_count",
    "at_count",
    "query_length",
    "digit_count",
    "keyword_count",
    "subdomain_count",
    "is_ip_host",
    "uses_shortener",
    "path_depth",
]


def _training_rows() -> tuple[list[list[float]], list[int]]:
    samples = [
        ("https://www.google.com/security", 0),
        ("https://github.com/login", 0),
        ("https://bank.example.com/account/summary", 0),
        ("https://docs.python.org/3/library", 0),
        ("http://192.168.2.1/verify/account/password", 1),
        ("http://secure-paypal-login.example.ru/verify?account=limited", 1),
        ("https://bit.ly/free-wallet-bonus", 1),
        ("http://login.account.verify.bank.example.co/security-update", 1),
        ("http://invoice-payment-urgent.example.net/wire", 1),
        ("https://example.com/products", 0),
    ]
    x: list[list[float]] = []
    y: list[int] = []
    for url, label in samples:
        features, _ = extract_url_features(url)
        x.append([features[name] for name in FEATURE_ORDER])
        y.append(label)
    return x, y


def train_default_model(path: Path = MODEL_PATH) -> RandomForestClassifier:
    x, y = _training_rows()
    model = RandomForestClassifier(n_estimators=120, random_state=42, class_weight="balanced")
    model.fit(x, y)
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, path)
    return model


def load_model() -> Any:
    if MODEL_PATH.exists():
        return joblib.load(MODEL_PATH)
    return train_default_model(MODEL_PATH)


def verdict(probability: float) -> str:
    if probability >= 0.75:
        return "phishing"
    if probability >= 0.45:
        return "suspicious"
    return "safe"


def predict_url(model: Any, url: str) -> dict:
    features, indicators = extract_url_features(url)
    row = np.array([[features[name] for name in FEATURE_ORDER]])
    probability = float(model.predict_proba(row)[0][1])
    return {
        "probability": probability,
        "verdict": verdict(probability),
        "score": round(probability * 100),
        "indicators": indicators,
        "features": features,
    }


def predict_text(text: str) -> dict:
    features, indicators = extract_text_features(text)
    raw = (
        features["url_count"] * 0.18
        + features["urgency_terms"] * 0.16
        + features["credential_terms"] * 0.2
        + features["money_terms"] * 0.14
        + min(features["exclamation_count"], 5) * 0.03
        + (0.18 if features["uppercase_ratio"] > 0.18 else 0)
    )
    probability = max(0.03, min(raw, 0.97))
    return {
        "probability": probability,
        "verdict": verdict(probability),
        "score": round(probability * 100),
        "indicators": indicators,
        "features": features,
    }
