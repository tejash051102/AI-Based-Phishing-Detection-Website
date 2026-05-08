# PhishGuard AI Service

FastAPI service for phishing URL and email/text prediction.

## Run locally

```bash
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
python train_model.py
uvicorn app.main:app --reload --port 8000
```

The included model is intentionally small for demonstration. Replace `data/` with a real labelled phishing dataset and extend `train_model.py` for production use.

