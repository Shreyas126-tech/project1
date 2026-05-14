import os
os.environ["USE_TORCH"] = "1"
import uvicorn
from main import app

if __name__ == "__main__":
    print("Testing server startup...")
    uvicorn.run(app, host="127.0.0.1", port=8001)
