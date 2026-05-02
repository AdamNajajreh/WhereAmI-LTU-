# Campus Navigator — Backend

FastAPI server that runs the MobileNetV2 building classifier. Accepts an image upload and returns the predicted building name with a confidence score.

## Prerequisites

- Docker (recommended), **or** Python 3.12+ with pip

## Run with Docker

```bash
docker build -t campus-navigator-api .
docker run -p 8000:8000 campus-navigator-api
```

## Run without Docker

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

The model file `models/baseline_mobilenetv2_best.keras` must be present before starting.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check — returns `{"status": "ok"}` |
| POST | `/predict` | Accepts a multipart image, returns building name and confidence |

### Example

```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@photo.jpg"
```

```json
{
  "building": "Building 9",
  "confidence": 0.97,
  "all_scores": { "Building 2": 0.01, "Building 9": 0.97, ... }
}
```
