from app.model import load_model, predict_text, predict_url


def test_predict_url_returns_probability_and_features():
    result = predict_url(load_model(), "http://login.account.verify.example.ru/password")

    assert 0 <= result["probability"] <= 1
    assert result["verdict"] in {"safe", "suspicious", "phishing"}
    assert "features" in result


def test_predict_text_scores_phishing_language():
    result = predict_text("Urgent payment failed. Login now and confirm your account password!")

    assert result["probability"] > 0.3
    assert result["score"] == round(result["probability"] * 100)

