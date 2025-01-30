from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Load the embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

def recommend_resumes(job_desc, resumes, top_n=5):
    """
    Recommends top N resumes based on cosine similarity between job description and resumes.

    Args:
        job_desc (str): Job description text.
        resumes (list): List of Resume objects.
        top_n (int): Number of recommendations to return (default: 5).

    Returns:
        list: Top N recommended resumes.
    """
    # Encode job description
    job_embedding = model.encode([job_desc])
    
    # Retrieve and validate resume embeddings
    valid_resumes = []
    resume_embeddings = []
    
    for resume in resumes:
        if resume.embedding:  # Skip resumes with missing embeddings
            embedding = np.frombuffer(resume.embedding, dtype=np.float32)
            if embedding.shape[0] == 384:  # all-MiniLM-L6-v2 outputs 384-dim embeddings
                valid_resumes.append(resume)
                resume_embeddings.append(embedding)
    
    # Check if any valid resumes exist
    if not valid_resumes:
        return []
    
    # Convert to numpy array with consistent shape
    resume_embeddings = np.array(resume_embeddings)
    
    # Compute similarity
    similarity_scores = cosine_similarity(job_embedding, resume_embeddings).flatten()
    
    # Sort and return top N resumes
    scored_resumes = sorted(
        zip(valid_resumes, similarity_scores),
        key=lambda x: x[1],
        reverse=True
    )
    return [resume for resume, score in scored_resumes[:top_n]]