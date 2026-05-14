import pdfplumber
from docx import Document
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes."""
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text.strip())
    return "\n\n".join(text_parts)

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX bytes."""
    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)

def extract_text(filename: str, file_bytes: bytes) -> str:
    """Extract text from supported file types."""
    fname = filename.lower()
    if fname.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif fname.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    elif fname.endswith(".txt"):
        return file_bytes.decode("utf-8", errors="ignore")
    else:
        raise ValueError(f"Unsupported file type: {filename}")
