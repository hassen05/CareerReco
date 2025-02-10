import json
import numpy as np
import spacy
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import defaultdict

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

def load_resumes(json_path="merged_resumes.json"):
    """Load resumes from JSON file with error handling"""
    try:
        with open(json_path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading resumes: {e}")
        return []

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

def recommend_resumes(job_desc, resumes, top_n=5):
    """Enhanced recommendation system with multiple scoring factors"""
    # Process job description
    requirements = extract_job_requirements(job_desc)
    job_embedding = model.encode([job_desc])
    
    # Convert top_n to integer
    try:
        top_n = int(top_n)
    except (ValueError, TypeError):
        top_n = 5

    scored_resumes = []
    
    for resume in resumes:
        # Generate/validate embedding
        if "embedding" not in resume:
            embedding_text = enhance_resume_embedding(resume)
            resume["embedding"] = model.encode(embedding_text).astype(np.float32).tobytes()
        
        # Calculate enhanced score and breakdown
        scores = defaultdict(float)
        scores['similarity'] = cosine_similarity(job_embedding, model.encode([enhance_resume_embedding(resume)]))[0][0]
        scores['experience'] = min(sum(job['years'] for job in resume.get('experience', [])) / max(requirements['experience'], 1), 1.0)
        resume_text = ' '.join(resume.get('skills', []) + [resume.get('education', '')])
        matches = sum(1 for kw in requirements['keywords'] if kw in resume_text)
        scores['keywords'] = matches / len(requirements['keywords']) if len(requirements['keywords']) > 0 else 0

        scores['education'] = 1.0 if requirements['education'].lower() in resume.get('education', '').lower() else 0

        # Calculate final weighted score
        total_score = sum(WEIGHTS[k] * scores[k] for k in WEIGHTS)

        # Store score with resume
        scored_resumes.append((resume, total_score, scores))  # Include breakdown

    # Sort by composite score
    scored_resumes.sort(key=lambda x: x[1], reverse=True)

    # Format output with explanation
    return [{
        **resume,
        "score": float(score),
        "score_breakdown": {
            "similarity": float(score_breakdown['similarity']),
            "experience": float(score_breakdown['experience']),
            "keywords": float(score_breakdown['keywords']),
            "education": float(score_breakdown['education'])
        },
        "embedding": None
    } for resume, score, score_breakdown in scored_resumes[:top_n]]
