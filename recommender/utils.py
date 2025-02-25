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
from django.core.cache import cache
from multiprocessing import Pool
from datetime import datetime
from supabase import create_client
from django.conf import settings
import base64

# Load models
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer("all-MiniLM-L6-v2")

# Configuration - Adjust these weights based on importance
WEIGHTS = {
    'similarity': 0.5,
    'experience': 0.2,
    'keywords': 0.1,
    'education': 0.1,
    'languages': 0.05,
    'certifications': 0.05
}

logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def load_resumes():
    """Load resumes from Supabase and join with profile data"""
    try:
        # Fetch resumes
        resumes_response = supabase.table('resumes').select('*').execute()
        resumes = resumes_response.data

        # Fetch profiles
        profiles_response = supabase.table('profiles').select('*').execute()
        profiles = profiles_response.data

        # Join resumes with profiles
        for resume in resumes:
            profile = next((p for p in profiles if p['id'] == resume['user_id']), None)
            if profile:
                resume['name'] = f"{profile.get('first_name', '')} {profile.get('last_name', '')}"
                resume['email'] = profile.get('email', '')
                resume['phone'] = profile.get('phone', '')
                resume['address'] = profile.get('address', '')
                

        # Decode Base64 embeddings
        for resume in resumes:
            if resume.get('embedding'):
                embedding_bytes = base64.b64decode(resume['embedding'])
                resume['embedding'] = np.frombuffer(embedding_bytes, dtype='float32')

        # Ensure education is properly formatted
        for resume in resumes:
            # Convert education to list if it's a single object
            if 'education' in resume and isinstance(resume['education'], dict):
                resume['education'] = [resume['education']]
            # Add empty array if education is missing
            if 'education' not in resume:
                resume['education'] = []

        logger.debug(f"Loaded Resumes: {resumes[:1]}")  # Log first resume
        return resumes
    except Exception as e:
        logger.error(f'Error loading resumes: {str(e)}')
        return []

def validate_resume(resume):
    """Validate required resume fields"""
    required_fields = ['skills', 'experience', 'education', 'user_id', 'embedding']
    return all(field in resume for field in required_fields)

def extract_job_requirements(job_desc):
    """Extract key requirements from job description using NLP"""
    doc = nlp(job_desc)
    
    requirements = {
        'keywords': [],
        'experience': 0,
        'education': '',
        'languages': [],
        'certifications': []
    }

    # Extract experience
    for ent in doc.ents:
        if ent.label_ == 'DATE' and 'year' in ent.text:
            requirements['experience'] = max(int(t.text) for t in ent if t.like_num)

    # Extract education, languages, and certifications
    for chunk in doc.noun_chunks:
        if 'degree' in chunk.text.lower() or 'bachelor' in chunk.text.lower():
            requirements['education'] = chunk.text
        if 'language' in chunk.text.lower():
            requirements['languages'].append(chunk.text)
        if 'certified' in chunk.text.lower():
            requirements['certifications'].append(chunk.text)

    # Extract keywords using TF-IDF
    tfidf = TfidfVectorizer(stop_words='english', max_features=20)
    tfidf.fit([job_desc])
    requirements['keywords'] = tfidf.get_feature_names_out()

    return requirements

def enhance_resume_embedding(resume):
    """Generate enhanced embedding text with structured information"""
    education = ' '.join([edu.get('degree', '') for edu in resume.get('education', [])])
    skills = ' '.join(resume.get('skills', []))
    experience = ' '.join([
        f"{exp.get('position', '')} at {exp.get('company', '')} for {exp.get('years', '')} years"
        for exp in resume.get('experience', [])
    ])
    languages = ' '.join(resume.get('languages', []))
    certifications = ' '.join(resume.get('certifications', []))
    
    # Combine all fields into a single text
    return f"{education} {skills} {experience} {languages} {certifications}"

def calculate_enhanced_score(resume, job_embedding, requirements):
    """Calculate weighted score combining multiple factors"""
    scores = defaultdict(float)
    
    # 1. Base similarity score
    resume_text = enhance_resume_embedding(resume)
    resume_embedding = model.encode([resume_text])
    scores['similarity'] = cosine_similarity([job_embedding], [resume_embedding])[0][0]
    
    # 2. Experience match
    total_experience = sum(
        (datetime.strptime(exp['end_date'], '%Y-%m-%d') - datetime.strptime(exp['start_date'], '%Y-%m-%d')).days / 365
        for exp in resume.get('experience', [])
    )
    scores['experience'] = min(total_experience / max(requirements['experience'], 1), 1.0)
    
    # 3. Keyword match
    resume_text = ' '.join(resume.get('skills', []) + [edu.get('degree', '') for edu in resume.get('education', [])])
    matches = sum(1 for kw in requirements['keywords'] if kw in resume_text)
    scores['keywords'] = matches / len(requirements['keywords']) if len(requirements['keywords']) > 0 else 0
    
    # 4. Education match
    scores['education'] = 1.0 if any(
        requirements['education'].lower() in edu.get('degree', '').lower()
        for edu in resume.get('education', [])
    ) else 0
    
    # 5. Languages match
    resume_languages = set(lang.lower() for lang in resume.get('languages', []))
    job_languages = set(lang.lower() for lang in requirements.get('languages', []))
    scores['languages'] = len(resume_languages.intersection(job_languages)) / len(job_languages) if len(job_languages) > 0 else 0
    
    # 6. Certifications match
    resume_certs = set(cert.lower() for cert in resume.get('certifications', []))
    job_certs = set(cert.lower() for cert in requirements.get('certifications', []))
    scores['certifications'] = len(resume_certs.intersection(job_certs)) / len(job_certs) if len(job_certs) > 0 else 0
    
    # Calculate weighted total
    total_score = sum(WEIGHTS[k] * scores[k] for k in WEIGHTS)
    return total_score

def get_job_embedding(job_desc):
    cache_key = f"job_embedding_{hash(job_desc)}"
    embedding = cache.get(cache_key)
    
    if not embedding:
        embedding = model.encode(job_desc).tobytes()
        cache.set(cache_key, embedding, timeout=3600)  # Cache for 1 hour
    
    logger.debug(f"Job Embedding Length: {len(embedding)}")
    return np.frombuffer(embedding, dtype="float32")

def score_resume(resume, job_embedding):
    try:
        logger.debug(f"Resume ID: {resume.get('user_id')}")
        logger.debug(f"Embedding Type: {type(resume['embedding'])}")
        logger.debug(f"Embedding Length: {len(resume['embedding'])}")
        
        # If embedding is stored as Base64, decode it
        if isinstance(resume["embedding"], str):
            embedding_bytes = base64.b64decode(resume["embedding"])
        else:
            embedding_bytes = resume["embedding"]

        # Convert to NumPy array
        resume_embedding = np.frombuffer(embedding_bytes, dtype="float32")
        similarity = cosine_similarity([job_embedding], [resume_embedding])[0][0]
        logger.debug(f"Similarity Score: {similarity}")
        return resume, similarity
    except Exception as e:
        logger.error(f'Error scoring resume: {str(e)}')
        return resume, 0

def recommend_resumes(job_desc, resumes, top_n=5):
    # Generate embedding for the job description
    job_embedding = model.encode(job_desc).astype('float32')
    
    # Calculate similarity scores
    scores = []
    for resume in resumes:
        if resume.get('embedding') is not None:
            similarity = np.dot(job_embedding, resume['embedding']) / (
                np.linalg.norm(job_embedding) * np.linalg.norm(resume['embedding'])
            )
            scores.append((resume, similarity))
            logger.debug(f"Resume ID: {resume.get('id')}, Similarity: {similarity:.4f}")
    
    # Sort by similarity and return top N
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:top_n]

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