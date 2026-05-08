import re
from urllib.parse import urlparse

SUSPICIOUS_KEYWORDS = {
    "login",
    "verify",
    "secure",
    "account",
    "update",
    "bank",
    "free",
    "bonus",
    "wallet",
    "password",
    "confirm",
    "limited",
    "urgent",
}

SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly"}


def normalize_url(url: str) -> str:
    value = url.strip()
    if not re.match(r"^https?://", value, re.I):
        value = f"http://{value}"
    return value


def extract_url_features(url: str) -> tuple[dict, list[str]]:
    normalized = normalize_url(url)
    parsed = urlparse(normalized)
    host = parsed.netloc.lower()
    path = parsed.path.lower()
    full = normalized.lower()
    indicators: list[str] = []

    features = {
        "url_length": len(normalized),
        "has_https": int(parsed.scheme == "https"),
        "dot_count": normalized.count("."),
        "hyphen_count": normalized.count("-"),
        "at_count": normalized.count("@"),
        "query_length": len(parsed.query),
        "digit_count": sum(char.isdigit() for char in normalized),
        "keyword_count": sum(1 for word in SUSPICIOUS_KEYWORDS if word in full),
        "subdomain_count": max(host.count(".") - 1, 0),
        "is_ip_host": int(bool(re.match(r"^\d{1,3}(\.\d{1,3}){3}$", host.split(":")[0]))),
        "uses_shortener": int(host.replace("www.", "") in SHORTENERS),
        "path_depth": len([part for part in path.split("/") if part]),
    }

    if features["url_length"] > 90:
        indicators.append("Unusually long URL")
    if not features["has_https"]:
        indicators.append("Missing HTTPS")
    if features["keyword_count"] >= 2:
        indicators.append("Multiple phishing-related keywords")
    if features["is_ip_host"]:
        indicators.append("IP address used instead of domain")
    if features["uses_shortener"]:
        indicators.append("URL shortener detected")
    if features["at_count"]:
        indicators.append("@ symbol can hide the real destination")
    if features["subdomain_count"] >= 3:
        indicators.append("Excessive subdomains")

    return features, indicators


def extract_text_features(text: str) -> tuple[dict, list[str]]:
    value = text.lower()
    urls = re.findall(r"https?://\S+|www\.\S+", value)
    money_terms = len(re.findall(r"\b(invoice|payment|refund|wire|crypto|wallet|prize)\b", value))
    urgency_terms = len(re.findall(r"\b(urgent|immediately|expires|suspend|limited|verify now)\b", value))
    credential_terms = len(re.findall(r"\b(password|login|account|otp|security code|confirm)\b", value))

    indicators: list[str] = []
    if urls:
        indicators.append(f"{len(urls)} link(s) found in message")
    if urgency_terms:
        indicators.append("Urgency language detected")
    if credential_terms:
        indicators.append("Credential harvesting language detected")
    if money_terms:
        indicators.append("Financial lure language detected")

    features = {
        "text_length": len(text),
        "url_count": len(urls),
        "urgency_terms": urgency_terms,
        "credential_terms": credential_terms,
        "money_terms": money_terms,
        "exclamation_count": text.count("!"),
        "uppercase_ratio": sum(1 for c in text if c.isupper()) / max(len(text), 1),
    }
    return features, indicators

