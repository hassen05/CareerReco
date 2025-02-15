import json
import numpy as np
import spacy
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import defaultdict
from functools import lru_cache
import time
import logging
from resume_recommender.settings import mongo_db
from django.core.cache import cache
from multiprocessing import Pool
from datetime import datetime

# Load models
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer("all-MiniLM-L6-v2")

# Configuration - Adjust these weights based on importance
WEIGHTS = {
    'similarity': 0.6,
    'experience': 0.2,
    'keywords': 0.15,
    'education': 0.05
}

logger = logging.getLogger(__name__)

def load_resumes():
    """Load resumes from MongoDB"""
    resumes_collection = mongo_db["resumes"]
    resumes = list(resumes_collection.find())
    for resume in resumes:
        dob = datetime.strptime(resume["dob"], "%Y-%m-%d")  # Parse the date of birth
        today = datetime.today()
        age = today.year - dob.year
        if (today.month, today.day) < (dob.month, dob.day):
            age -= 1
        resume["age"] = age  # Add the age field to the resume
    return resumes

def validate_resume(resume):
    """Validate required resume fields"""
    required_fields = ['skills', 'experience', 'education']
    return all(field in resume for field in required_fields)

def extract_job_requirements(job_desc):
    """Extract key requirements from job description using NLP"""
    doc = nlp(job_desc)
    
    requirements = {
        'keywords': [],
        'experience': 0,
        'education': '',
        'certifications': []
    }

    # Extract experience
    for ent in doc.ents:
        if ent.label_ == 'DATE' and 'year' in ent.text:
            requirements['experience'] = max(int(t.text) for t in ent if t.like_num)

    # Extract education and certifications
    for chunk in doc.noun_chunks:
        if 'degree' in chunk.text.lower() or 'bachelor' in chunk.text.lower():
            requirements['education'] = chunk.text
        if 'certified' in chunk.text.lower():
            requirements['certifications'].append(chunk.text)

    # Extract keywords using TF-IDF
    tfidf = TfidfVectorizer(stop_words='english', max_features=20)
    tfidf.fit([job_desc])
    requirements['keywords'] = tfidf.get_feature_names_out()

    return requirements

def enhance_resume_embedding(resume):
    """Generate enhanced embedding text with structured information"""
    components = []
    
    # Add section headers to emphasize different parts
    if resume.get("skills"):
        components.append(f"[SKILLS] {', '.join(resume['skills'])}")
    
    if resume.get("experience"):
        exp_text = " ".join(
            f"{job.get('position', '').upper()} at {job.get('company', '')} "
            f"({job.get('years', 0)} years)" 
            for job in resume["experience"]
        )
        components.append(f"[EXPERIENCE] {exp_text}")
    
    if resume.get("education"):
        components.append(f"[EDUCATION] {resume['education'].upper()}")
    
    if resume.get("certifications"):
        components.append(f"[CERTIFICATIONS] {', '.join(resume['certifications'])}")
    
    return ". ".join(components)

def calculate_enhanced_score(resume, job_embedding, requirements):
    """Calculate weighted score combining multiple factors"""
    scores = defaultdict(float)
    
    # 1. Base similarity score
    resume_text = enhance_resume_embedding(resume)
    resume_embedding = model.encode([resume_text])
    scores['similarity'] = cosine_similarity(job_embedding, resume_embedding)[0][0]

    # 2. Experience match
    total_experience = sum(job['years'] for job in resume.get('experience', []))
    scores['experience'] = min(total_experience / max(requirements['experience'], 1), 1.0)

    # 3. Keyword match
    resume_text = ' '.join(resume.get('skills', []) + [resume.get('education', '')])
    matches = sum(1 for kw in requirements['keywords'] if kw in resume_text)
    scores['keywords'] = matches / len(requirements['keywords']) if len(requirements['keywords']) > 0 else 0


    # 4. Education match
    scores['education'] = 1.0 if requirements['education'].lower() in resume.get('education', '').lower() else 0

    # Calculate weighted total
    total_score = sum(WEIGHTS[k] * scores[k] for k in WEIGHTS)
    return total_score

def get_job_embedding(job_desc):
    cache_key = f"job_embedding_{hash(job_desc)}"
    embedding = cache.get(cache_key)
    
    if not embedding:
        embedding = model.encode(job_desc).tobytes()
        cache.set(cache_key, embedding, timeout=3600)  # Cache for 1 hour
    
    return np.frombuffer(embedding, dtype="float32")

def score_resume(resume, job_embedding):
    resume_embedding = np.frombuffer(resume["embedding"], dtype="float32")
    return resume, cosine_similarity([job_embedding], [resume_embedding])[0][0]

def recommend_resumes(job_desc, resumes, top_n=5):
    job_embedding = get_job_embedding(job_desc)
    
    with Pool() as pool:
        scored_resumes = pool.starmap(score_resume, [(resume, job_embedding) for resume in resumes])
    
    scored_resumes.sort(key=lambda x: x[1], reverse=True)
    
    # Include score in the returned data
    return [{"resume": resume, "score": score} for resume, score in scored_resumes[:top_n]]

def preprocess_text(text):
    """Clean and standardize text before embedding"""
    doc = nlp(text.lower())
    tokens = [token.text for token in doc 
             if not token.is_stop and not token.is_punct]
    return " ".join(tokens)

def get_skill_similarity(resume_skills, job_skills):
    """Calculate skill-specific similarity"""
    resume_set = set(s.lower() for s in resume_skills)
    job_set = set(s.lower() for s in job_skills)
    if not job_set:
        return 0
    return len(resume_set.intersection(job_set)) / len(job_set)

@lru_cache(maxsize=1000)
def get_embedding(text):
    """Cache embeddings for better performance"""
    return model.encode([text])[0]

def log_recommendation_metrics(job_desc, num_candidates, duration):
    """Log recommendation performance metrics"""
    logger.info({
        'event': 'recommendation',
        'candidates': num_candidates,
        'duration': duration,
        'desc_length': len(job_desc)
    })
