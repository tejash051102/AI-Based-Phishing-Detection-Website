from app.features import extract_text_features, extract_url_features


def test_extract_url_features_flags_suspicious_url():
    features, indicators = extract_url_features("http://192.168.1.4/verify/account/password")

    assert features["has_https"] == 0
    assert features["is_ip_host"] == 1
    assert features["keyword_count"] >= 2
    assert "Missing HTTPS" in indicators


def test_extract_text_features_detects_credential_lure():
    features, indicators = extract_text_features(
        "URGENT! Your account will suspend today. Login now and confirm your password."
    )

    assert features["urgency_terms"] >= 1
    assert features["credential_terms"] >= 1
    assert "Urgency language detected" in indicators

