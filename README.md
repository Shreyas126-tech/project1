# SimplifyAI: Zero-Cost AI-Based Text Simplification Platform

SimplifyAI is a multilingual, readability-controlled text simplification platform designed to be free, scalable, and ethical. It follows the roadmap derived from cutting-edge research in NLP and Education.

## Features
- **CEFR-Based Control**: Simplify text to specific levels (A1-C2).
- **Multilingual Support**: Integration ready for multiple languages.
- **Semantic Validation**: Ensures the simplified text preserves original meaning using Sentence-BERT.
- **Evaluation Engine**: Real-time SARI and BLEU score calculation.
- **Premium UI**: Modern dark-mode interface with glassmorphism and smooth animations.

## Tech Stack
- **Frontend**: Vite + React, Framer Motion, Lucide Icons, Vanilla CSS.
- **Backend**: FastAPI (Python), Hugging Face Inference API.
- **AI/ML**: Sentence Transformers, NLTK, Textstat, FAISS (RAG).

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Hugging Face API Token (Optional, for real AI results)

### Backend Setup
1. Navigate to the `backend` folder.
2. Install dependencies: `pip install -r requirements.txt`.
3. Create a `.env` file and add: `HF_TOKEN=your_huggingface_token`.
4. Run the server: `python main.py`.

### Frontend Setup
1. Navigate to the `frontend` folder.
2. Install dependencies: `npm install`.
3. Run the development server: `npm run dev`.

## Roadmap Implementation
- [x] **Phase 1: Dataset Collection** (Script provided in `/data`)
- [x] **Phase 3: Readability Controller** (Integrated in backend)
- [x] **Phase 4: Meaning Preservation** (Semantic validation integrated)
- [x] **Phase 5: Evaluation Engine** (SARI/BLEU integrated)
- [x] **Phase 9: Deployment** (Ready for Vercel/Render)