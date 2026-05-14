import json
import os

USER_DATA_FILE = "user_stats.json"

def get_user_stats():
    if not os.path.exists(USER_DATA_FILE):
        return {"xp": 0, "level": 1, "simplifications_done": 0, "streak": 0}
    with open(USER_DATA_FILE, "r") as f:
        return json.load(f)

def update_user_stats(xp_gain: int):
    stats = get_user_stats()
    stats["xp"] += xp_gain
    stats["simplifications_done"] += 1
    
    # Simple level logic: every 100 XP is a level
    new_level = (stats["xp"] // 100) + 1
    if new_level > stats["level"]:
        stats["level"] = new_level
        print(f"Level Up! Now at level {new_level}")
        
    with open(USER_DATA_FILE, "w") as f:
        json.dump(stats, f)
    return stats

def calculate_xp(text_length: int, similarity: float) -> int:
    """
    Calculate XP based on the length of text simplified and how well meaning was preserved.
    """
    base_xp = min(50, text_length // 10)
    bonus = int(similarity * 20)
    return base_xp + bonus
