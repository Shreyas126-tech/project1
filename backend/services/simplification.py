import os
os.environ["USE_TORCH"] = "1"
from transformers import T5ForConditionalGeneration, T5Tokenizer, AutoModelForSeq2SeqLM, AutoTokenizer
import torch
import re

# Simplification Model
model_name = "google/flan-t5-base"
simp_tok = None
simp_mod = None

# Translation Model (NLLB)
trans_model_name = "facebook/nllb-200-distilled-600M"
trans_tok = None
trans_mod = None

NLLB_LANG_CODES = {
    "english": "eng_Latn",
    "hindi": "hin_Deva",
    "kannada": "kan_Knda",
    "tamil": "tam_Taml",
    "german": "deu_Latn",
    "spanish": "spa_Latn",
    "french": "fra_Latn"
}

def get_simp_model():
    global simp_tok, simp_mod
    if simp_mod is None:
        print(f"Loading simplification model: {model_name}...")
        simp_tok = T5Tokenizer.from_pretrained(model_name)
        simp_mod = T5ForConditionalGeneration.from_pretrained(model_name)
    return simp_tok, simp_mod

def get_trans_model():
    global trans_tok, trans_mod
    if trans_mod is None:
        print(f"Loading translation model: {trans_model_name}...")
        trans_tok = AutoTokenizer.from_pretrained(trans_model_name)
        trans_mod = AutoModelForSeq2SeqLM.from_pretrained(trans_model_name)
    return trans_tok, trans_mod

def split_into_chunks(text: str, max_words: int = 200) -> list:
    paragraphs = [p.strip() for p in re.split(r'\n{2,}', text) if p.strip()]
    chunks, current = [], ""
    for para in paragraphs:
        if len((current + " " + para).split()) > max_words and current:
            chunks.append(current.strip())
            current = para
        else:
            current = (current + "\n\n" + para).strip()
    if current:
        chunks.append(current.strip())
    return chunks or [text]

def simplify_chunk(tok, mod, chunk: str, target_level: str) -> str:
    prompt = (
        f"Rewrite this complex text for a {target_level} level student. "
        f"You MUST use formatting like bullet points (-), identify and bold KEYWORDS, and explain them clearly. "
        f"Structure your answer as:\n"
        f"Keywords:\n"
        f"- [Keyword]: [Definition]\n\n"
        f"Explanation:\n"
        f"- [Bullet point 1]\n"
        f"- [Bullet point 2]\n\n"
        f"Text to simplify:\n{chunk}"
    )

    inputs = tok(prompt, return_tensors="pt", max_length=512, truncation=True)
    with torch.no_grad():
        outputs = mod.generate(
            **inputs,
            max_length=600,
            min_length=100,
            do_sample=True,
            temperature=0.6,
            top_p=0.9,
            repetition_penalty=1.2,
        )
    return tok.decode(outputs[0], skip_special_tokens=True).strip()

def translate_text(text: str, target_lang: str) -> str:
    """Translate simplified English text into the target language."""
    if target_lang.lower() == "english":
        return text
    
    tgt_lang_code = NLLB_LANG_CODES.get(target_lang.lower(), "eng_Latn")
    tok, mod = get_trans_model()
    
    # NLLB requires tgt_lang in generation args
    inputs = tok(text, return_tensors="pt", max_length=1024, truncation=True)
    
    # We must explicitly force the BOS token to be the target language
    forced_bos_token_id = tok.convert_tokens_to_ids(tgt_lang_code)
    
    with torch.no_grad():
        outputs = mod.generate(
            **inputs, 
            forced_bos_token_id=forced_bos_token_id, 
            max_length=1024
        )
    
    return tok.decode(outputs[0], skip_special_tokens=True)

def format_student_output(chunks_out: list, target_level: str, language: str) -> str:
    label = f"Simplified to {target_level}"
    header = f"📖 SimplifyAI — {label} ({language})\n{'─'*50}\n\n"
    sections = []
    for i, chunk in enumerate(chunks_out, 1):
        sections.append(f"📌 Section {i}:\n{chunk}")
    return header + "\n\n".join(sections)

def simplify_with_ai(text: str, target_level: str, language: str = "English") -> str:
    if not text.strip():
        return ""
    try:
        tok, mod = get_simp_model()
        chunks = split_into_chunks(text, max_words=180)
        
        simplified_chunks = []
        for i, chunk in enumerate(chunks):
            # 1. Simplify in English first for highest quality
            simp_eng = simplify_chunk(tok, mod, chunk, target_level)
            
            # 2. Translate if needed
            if language.lower() != "english":
                simp_final = translate_text(simp_eng, language)
            else:
                simp_final = simp_eng
                
            simplified_chunks.append(simp_final)
            
        return format_student_output(simplified_chunks, target_level, language)
    except Exception as e:
        print(f"Error in simplification: {e}")
        return f"Error during simplification/translation: {str(e)}"
