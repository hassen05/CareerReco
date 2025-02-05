import json
import numpy as np
import spacy
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load models
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer("all-MiniLM-L6-v2")

def load_resumes(json_path="updated_cs_resumes.json"):
    """Load resumes from JSON file."""
    try:
        with open(json_path) as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def extract_required_experience(job_desc):
    """Extract minimum experience requirement from job description."""
    doc = nlp(job_desc)
    min_exp = 0
    for token in doc:
        if token.like_num and ("year" in token.text.lower() or "yr" in token.text.lower()):
            min_exp = int(token.text)
    return min_exp

def recommend_resumes(job_desc, resumes, top_n=5):
    """Recommend resumes based on job description."""
    # Filter by experience
    min_exp = extract_required_experience(job_desc)
    filtered = [
        r for r in resumes 
        if sum(job["years"] for job in r["experience"]) >= min_exp
    ]
    
    # Generate embeddings
    job_embedding = model.encode([job_desc])
    resume_embeddings = []
    for resume in filtered:
        text = f"{' '.join(resume['skills'])} {resume['education']} {' '.join(resume['certifications'])}"
        embedding = model.encode(text)
        resume_embeddings.append(embedding)
    
    # Compute similarity
    similarities = cosine_similarity(job_embedding, resume_embeddings).flatten()
    scored = sorted(zip(filtered, similarities), key=lambda x: x[1], reverse=True)
    
    return [{"resume": r, "score": s} for r, s in scored[:top_n]]