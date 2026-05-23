import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import train_test_split

from .features import extract_url_features
from .model import FEATURE_ORDER, MODEL_PATH

METRICS_PATH = Path("app/models/metrics.json")
VERSIONS_DIR = Path("app/models/versions")
DEFAULT_DATASET = Path("data/sample_phishing_urls.csv")


def load_dataset(dataset_path: Path = DEFAULT_DATASET) -> pd.DataFrame:
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset not found: {dataset_path}")
    data = pd.read_csv(dataset_path)
    required = {"url", "label"}
    if not required.issubset(data.columns):
        raise ValueError("Dataset must include url and label columns")
    return data.dropna(subset=["url", "label"])


def build_feature_frame(data: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    rows = []
    for url in data["url"].astype(str):
        features, _ = extract_url_features(url)
        rows.append({name: features[name] for name in FEATURE_ORDER})
    return pd.DataFrame(rows), data["label"].astype(int)


def train_from_dataset(dataset_path: Path | None = None) -> dict:
    dataset_path = dataset_path or DEFAULT_DATASET
    data = load_dataset(dataset_path)
    x, y = build_feature_frame(data)
    stratify = y if y.nunique() > 1 and y.value_counts().min() > 1 else None
    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.25,
        random_state=42,
        stratify=stratify,
    )

    model = RandomForestClassifier(
        n_estimators=220,
        random_state=42,
        class_weight="balanced",
        max_depth=10,
    )
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, predictions, average="binary", zero_division=0)

    version = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    VERSIONS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(model, VERSIONS_DIR / f"phishing_url_model_{version}.joblib")

    metrics = {
        "version": version,
        "dataset": str(dataset_path),
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "samples": int(len(data)),
        "features": FEATURE_ORDER,
        "accuracy": float(accuracy_score(y_test, predictions)),
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "confusionMatrix": confusion_matrix(y_test, predictions).tolist(),
        "classificationReport": classification_report(y_test, predictions, output_dict=True, zero_division=0),
    }
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics


def load_metrics() -> dict:
    if not METRICS_PATH.exists():
        return {
            "version": "demo",
            "trainedAt": None,
            "samples": 0,
            "message": "Train the model to generate metrics and version metadata.",
        }
    return json.loads(METRICS_PATH.read_text(encoding="utf-8"))
