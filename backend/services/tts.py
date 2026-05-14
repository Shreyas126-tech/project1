import edge_tts
import os
import uuid

AUDIO_DIR = "audio_files"
os.makedirs(AUDIO_DIR, exist_ok=True)

VOICE_MAP = {
    "english":  "en-US-AriaNeural",
    "german":   "de-DE-KatjaNeural",
    "hindi":    "hi-IN-SwaraNeural",
    "kannada":  "kn-IN-SapnaNeural",
    "tamil":    "ta-IN-PallaviNeural",
    "spanish":  "es-ES-ElviraNeural",
    "french":   "fr-FR-DeniseNeural",
}

async def generate_podcast_audio(text: str, language: str = "English") -> str:
    """Async neural TTS using Microsoft Edge voices. Returns MP3 file path."""
    voice = VOICE_MAP.get(language.lower(), "en-US-AriaNeural")
    file_id = str(uuid.uuid4())[:8]
    output_path = os.path.join(AUDIO_DIR, f"podcast_{file_id}.mp3")
    intro = f"Welcome to SimplifyAI Podcast. Here is your simplified content. "
    communicate = edge_tts.Communicate(intro + text, voice)
    await communicate.save(output_path)
    return output_path
