from fastapi import FastAPI, UploadFile, HTTPException
from PIL import Image, ImageOps
import numpy as np
import tensorflow as tf
import io

# ─── Config ───────────────────────────────────────────────────────────────────

MODEL_PATH  = "models/baseline_mobilenetv2_best.keras"
IMAGE_SIZE  = (224, 224)
CLASS_NAMES = [
    "Building 2", "Building 3", "Building 4", "Building 5",
    "Building 7", "Building 8", "Building 9", "Building 10",
]

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(title="LTU Campus Navigator API")

# Load model once at startup — keeps it in memory for all requests
model = tf.keras.models.load_model(MODEL_PATH)
print(f"Model loaded from {MODEL_PATH}")

# ─── Preprocessing ────────────────────────────────────────────────────────────

def preprocess(image_bytes: bytes) -> np.ndarray:
    """
    Prepares a raw image for inference. Must match the training pipeline exactly:
      1. exif_transpose  — corrects iPhone rotation stored in EXIF metadata
      2. convert("RGB")  — drops alpha channel if the image is a PNG
      3. resize(224, 224) — MobileNetV2 expects exactly 224x224
      4. preprocess_input — scales pixels from [0, 255] to [-1, 1]
      5. expand_dims     — adds batch dimension: (224, 224, 3) → (1, 224, 224, 3)
    """
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")
    img = img.resize(IMAGE_SIZE, Image.BILINEAR)

    x = np.array(img, dtype=np.float32)
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    x = np.expand_dims(x, axis=0)
    return x

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    image_bytes = await file.read()

    try:
        x = preprocess(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not process image: {e}")

    preds       = model.predict(x, verbose=0)
    class_index = int(np.argmax(preds))
    confidence  = float(np.max(preds))
    building    = CLASS_NAMES[class_index]

    return {
        "building":   building,
        "confidence": confidence,
        "all_scores": {
            name: float(preds[0][i])
            for i, name in enumerate(CLASS_NAMES)
        },
    }
