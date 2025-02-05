# utils.py
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load sentence transformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

def load_resumes(json_path="updated_cs_resumes.json"):
    """Load resumes from JSON file."""
    try:
        with open(json_path) as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def generate_embedding_text(resume):
    """
    Generates a consolidated text string from resume data for embedding generation.
    Includes skills, experience, education, and certifications.
    """
    components = []
    
    # Skills
    if resume.get("skills"):
        components.append(f"Skills: {', '.join(resume['skills'])}")
    
    # Experience
    if resume.get("experience"):
        exp_text = " ".join(
            f"{job.get('position', '')} at {job.get('company', '')} "
            f"for {job.get('years', 0)} years" 
            for job in resume["experience"]
        )
        components.append(f"Experience: {exp_text}")
    
    # Education
    if resume.get("education"):
        components.append(f"Education: {resume['education']}")
    
    # Certifications
    if resume.get("certifications"):
        components.append(f"Certifications: {', '.join(resume['certifications'])}")
    
    return " ".join(components)

def recommend_resumes(job_desc, resumes, top_n=5):
    """
    Recommends top resumes based on holistic similarity between job description 
    and resume content (skills, experience, education, certifications).
    
    Returns:
        List of resumes with similarity scores, sorted by relevance.
    """
    # Encode job description
    job_embedding = model.encode([job_desc])
    
    # Process all resumes
    valid_resumes = []
    resume_embeddings = []
    
    for resume in resumes:
        # Handle existing embeddings
        if "embedding" in resume:
            try:
                embedding = np.frombuffer(resume["embedding"], dtype=np.float32)
                if embedding.shape[0] == 384:  # Validate embedding dimensions
                    valid_resumes.append(resume)
                    resume_embeddings.append(embedding)
                    continue
            except Exception as e:
                pass
        
        # Generate new embedding if missing or invalid
        embedding_text = generate_embedding_text(resume)
        embedding = model.encode(embedding_text)
        resume["embedding"] = np.asarray(embedding).astype(np.float32).tobytes()
        valid_resumes.append(resume)
        resume_embeddings.append(embedding)
    
    if not valid_resumes:
        return []
    
    # Calculate similarity scores
    similarity_scores = cosine_similarity(job_embedding, resume_embeddings).flatten()
    
    # Combine resumes with scores and sort
    scored_resumes = sorted(
        zip(valid_resumes, similarity_scores),
        key=lambda x: x[1],
        reverse=True
    )
    
    # Format output
    return [
        {
            **resume,
            "score": float(score),
            "embedding": None  # Remove binary data from output
        }
        for resume, score in scored_resumes[:top_n]
    ]