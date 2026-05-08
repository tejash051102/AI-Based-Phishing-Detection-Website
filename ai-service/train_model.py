from app.model import train_default_model


if __name__ == "__main__":
    train_default_model()
    print("Model trained and saved to app/models/phishing_url_model.joblib")

