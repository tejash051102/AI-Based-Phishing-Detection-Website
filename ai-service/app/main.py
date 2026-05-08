from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .model import load_model, predict_text, predict_url, train_default_model
from .schemas import PredictionResponse, TextRequest, UrlRequest

app = FastAPI(title="PhishGuard AI Service", version="1.0.0")
model = load_model()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "phishguard-ai"}


@app.post("/predict/url", response_model=PredictionResponse)
def url_prediction(payload: UrlRequest):
    return predict_url(model, payload.url)


@app.post("/predict/text", response_model=PredictionResponse)
def text_prediction(payload: TextRequest):
    return predict_text(payload.text)


@app.post("/train")
def train():
    global model
    model = train_default_model()
    return {"message": "Model trained", "samples": "demo"}

