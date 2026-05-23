from pathlib import Path

from app.training import train_from_dataset


if __name__ == "__main__":
    metrics = train_from_dataset(Path("data/sample_phishing_urls.csv"))
    print(f"Model version {metrics['version']} trained with accuracy {metrics['accuracy']:.2f}")
