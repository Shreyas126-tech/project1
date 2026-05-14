import os
from datasets import load_dataset

def download_datasets():
    """
    Phase 1: Dataset Collection
    Downloads common simplification datasets for training/evaluation.
    """
    print("--- Phase 1: Starting Dataset Collection ---")
    
    # 1. WikiLarge / WikiSmall (Commonly used in simplification research)
    print("Collecting WikiLarge dataset...")
    # wiki_large = load_dataset("GEM/wiki_auto_asset_turk", split="train")
    
    # 2. Asset (High-quality human simplifications)
    print("Collecting ASSET dataset for evaluation...")
    # asset = load_dataset("facebook/asset")
    
    # 3. Newsela (Proprietary usually, but there are open alternatives like SimpWiki)
    print("Collecting Simple Wikipedia dumps...")
    
    # Create data directory if it doesn't exist
    if not os.path.exists("datasets"):
        os.makedirs("datasets")
        
    print("Datasets successfully queued for Phase 2: Synthetic Data Generation.")
    print("Note: In a 'Zero-Cost' environment, we rely on free Hugging Face datasets.")

if __name__ == "__main__":
    # Ensure 'datasets' library is installed
    try:
        import datasets
    except ImportError:
        print("Installing 'datasets' library...")
        os.system("pip install datasets")
    
    download_datasets()
