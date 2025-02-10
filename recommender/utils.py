import json
import numpy as np
import spacy
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import defaultdict
import langdetect  # Detects language

# Load NLP models
nlp_en = spacy.load("en_core_web_sm")  # English
nlp_fr = spacy.load("fr_core_news_sm")  # French

# Load multilingual sentence transformer
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")  

# Configuration - Adjust these weights based on importance
WEIGHTS = {
    'similarity': 0.6,
    'experience': 0.2,
    'keywords': 0.15,
    'education': 0.05
}

def detect_language(text):
    """Detects if text is in French or English"""
    try:
        lang = langdetect.detect(text)
        return "fr" if lang == "fr" else "en"
    except:
        return "en"  # Default to English if detection fails

def extract_job_requirements(job_desc):
    """Extract key requirements from job description using NLP"""
    lang = detect_language(job_desc)
    nlp = nlp_fr if lang == "fr" else nlp_en  # Select language model

    doc = nlp(job_desc)
    requirements = {
        'keywords': [],
        'experience': 0,
        'education': '',
        'certifications': []
    }

    # Extract experience
    for ent in doc.ents:
        if ent.label_ == 'DATE' and ('year' in ent.text or 'an' in ent.text or 'année' in ent.text):
            requirements['experience'] = max(int(t.text) for t in ent if t.like_num)

    # Extract education and certifications
    for chunk in doc.noun_chunks:
        if any(keyword in chunk.text.lower() for keyword in ["degree", "bachelor", "diplôme", "baccalauréat"]):
            requirements['education'] = chunk.text
        if any(keyword in chunk.text.lower() for keyword in ["certified", "certifié", "certification"]):
            requirements['certifications'].append(chunk.text)

    # Extract keywords using TF-IDF
    stop_words = 'french' if lang == "fr" else 'english'
    tfidf = TfidfVectorizer(stop_words=stop_words, max_features=20)
    tfidf.fit([job_desc])
    requirements['keywords'] = tfidf.get_feature_names_out()

    return requirements
