from pydantic import BaseModel, Field


class UrlRequest(BaseModel):
    url: str = Field(min_length=3, max_length=4096)


class TextRequest(BaseModel):
    text: str = Field(min_length=3, max_length=12000)


class PredictionResponse(BaseModel):
    probability: float
    verdict: str
    score: int
    indicators: list[str]
    features: dict

