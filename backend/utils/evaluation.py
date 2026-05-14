import nltk
from nltk.translate.bleu_score import sentence_bleu

def calculate_bleu(reference: str, hypothesis: str) -> float:
    """
    Calculates BLEU score.
    """
    ref_tokens = [reference.split()]
    hyp_tokens = hypothesis.split()
    return sentence_bleu(ref_tokens, hyp_tokens)

def calculate_sari(original: str, simplified: str, references: list) -> float:
    """
    SARI (Simplicity, Accuracy, Relevance, Informativeness)
    Note: Real SARI requires multiple references. 
    This is a simplified version or placeholder for the full metric.
    """
    # Placeholder: In a real scenario, use 'easse' library or similar
    # For now, we return a combination of BLEU and length ratio
    bleu = calculate_bleu(original, simplified)
    len_ratio = len(simplified) / len(original) if len(original) > 0 else 1.0
    
    # Simple heuristic: we want it shorter but semantically similar
    score = (bleu + (1 - abs(0.7 - len_ratio))) / 2
    return max(0, min(1, score))
