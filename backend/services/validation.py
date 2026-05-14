from sentence_transformers import SentenceTransformer, util
import torch

# Use multilingual model for accurate cross-lingual semantic similarity (90-100% capable)
model_name = 'paraphrase-multilingual-MiniLM-L12-v2'
model = None

def get_model():
    global model
    if model is None:
        model = SentenceTransformer(model_name)
    return model

def check_semantic_preservation(original: str, simplified: str) -> float:
    """
    Returns a similarity score (0.0 to 1.0) between original and simplified text.
    """
    if not original or not simplified:
        return 0.0
        
    try:
        s_model = get_model()
        # Compute embeddings
        embeddings1 = s_model.encode(original, convert_to_tensor=True)
        embeddings2 = s_model.encode(simplified, convert_to_tensor=True)
        
        # Compute cosine similarity
        cosine_score = util.cos_sim(embeddings1, embeddings2)
        return float(cosine_score[0][0])
    except Exception as e:
        print(f"Error in semantic validation: {e}")
        return 0.0
