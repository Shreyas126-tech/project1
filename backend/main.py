import os
os.environ["USE_TORCH"] = "1"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from utils.readability import calculate_readability
from services.simplification import simplify_with_ai
from services.validation import check_semantic_preservation
from utils.evaluation import calculate_sari
from utils.gamification import update_user_stats, calculate_xp, get_user_stats
from services.extractor import extract_text
from services.tts import generate_podcast_audio
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SimplifyAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("audio_files", exist_ok=True)
app.mount("/audio", StaticFiles(directory="audio_files"), name="audio")


class SimplificationRequest(BaseModel):
    text: str
    target_level: str = "B1"
    language: str = "English"


class SimplificationResponse(BaseModel):
    original_text: str
    simplified_text: str
    readability_score: float
    level_achieved: str
    semantic_similarity: float
    sari_score: float
    user_stats: dict


@app.get("/")
async def root():
    return {"message": "SimplifyAI API running", "status": "ok"}


@app.get("/stats")
async def get_stats():
    return get_user_stats()


@app.post("/simplify", response_model=SimplificationResponse)
async def simplify_text(request: SimplificationRequest):
    simplified = simplify_with_ai(request.text, request.target_level, request.language)
    metrics = calculate_readability(simplified)
    similarity = check_semantic_preservation(request.text[:2000], simplified)
    sari = calculate_sari(request.text[:500], simplified, [request.text[:500]])
    xp_gain = calculate_xp(len(request.text), similarity)
    stats = update_user_stats(xp_gain)
    return SimplificationResponse(
        original_text=request.text,
        simplified_text=simplified,
        readability_score=metrics["score_normalized"],
        level_achieved=metrics["level_estimate"],
        semantic_similarity=similarity,
        sari_score=sari,
        user_stats=stats
    )


@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    target_level: str = Form("B1"),
    language: str = Form("English")
):
    try:
        file_bytes = await file.read()
        extracted = extract_text(file.filename, file_bytes)
        if not extracted.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from this file.")
        simplified = simplify_with_ai(extracted, target_level, language)
        metrics = calculate_readability(simplified)
        similarity = check_semantic_preservation(extracted[:2000], simplified)
        sari = calculate_sari(extracted[:500], simplified, [extracted[:500]])
        xp_gain = calculate_xp(len(extracted), similarity)
        stats = update_user_stats(xp_gain)
        return {
            "original_text": extracted[:300] + "..." if len(extracted) > 300 else extracted,
            "simplified_text": simplified,
            "readability_score": metrics["score_normalized"],
            "level_achieved": metrics["level_estimate"],
            "semantic_similarity": similarity,
            "sari_score": sari,
            "user_stats": stats,
            "filename": file.filename,
            "char_count": len(extracted)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


@app.post("/generate-audio")
async def audio_endpoint(request: SimplificationRequest):
    try:
        path = await generate_podcast_audio(request.text, request.language)
        filename = os.path.basename(path)
        return {"audio_url": f"/audio/{filename}", "filename": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
