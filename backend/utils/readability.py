import textstat

def calculate_readability(text: str) -> dict:
    """
    Calculates various readability scores for the given text.
    """
    if not text.strip():
        return {"flesch_kincaid": 0.0, "dale_chall": 0.0, "level_estimate": "A1", "score_normalized": 1.0}
    
    fk_grade = textstat.flesch_kincaid_grade(text)
    dc_score = textstat.dale_chall_readability_score(text)
    
    # Simple mapping from Grade to CEFR (rough estimate)
    # A1: 0-2, A2: 3-5, B1: 6-8, B2: 9-11, C1: 12-15, C2: 16+
    if fk_grade <= 2:
        cefr = "A1"
    elif fk_grade <= 5:
        cefr = "A2"
    elif fk_grade <= 8:
        cefr = "B1"
    elif fk_grade <= 11:
        cefr = "B2"
    elif fk_grade <= 15:
        cefr = "C1"
    else:
        cefr = "C2"
        
    return {
        "flesch_kincaid": fk_grade,
        "dale_chall": dc_score,
        "level_estimate": cefr,
        "score_normalized": max(0, min(1, 1 - (fk_grade / 20))) # 0 (complex) to 1 (simple)
    }
