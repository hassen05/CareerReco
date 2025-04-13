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
import re
from collections import Counter
from nltk.util import ngrams
from nltk.corpus import stopwords
from string import punctuation
from sklearn.feature_extraction.text import CountVectorizer

# Load models
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer("all-MiniLM-L6-v2")

# Configuration - Adjust these weights based on importance
WEIGHTS = {
    'similarity': 0.4,
    'experience': 0.25,
    'skill_seniority': 0.15,
    'keywords': 0.1,
    'education': 0.05,
    'languages': 0.03,
    'certifications': 0.02
}

logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

__all__ = ['load_resumes', 'enhance_resume_embedding', 'recommend_resumes']

def enhance_resume_embedding(resume):
    """Generate embedding text with contextual emphasis"""
    sections = []
    
    # Education with institution context
    education = []
    for edu in resume.get('education', []):
        institution = (edu.get('institution', '').strip() or 'Unknown Institution')
        degree = edu.get('degree', '')
        education.append(f"Studied {degree} at {institution}")
    if education:
        sections.append("Education Background: " + ". ".join(education))
    
    # Experience with role-specific context
    experience = []
    for exp in resume.get('experience', []):
        company = exp.get('company', 'Unknown Company')
        position = exp.get('position', '')
        description = exp.get('description', '')
        
        # Extract technical keywords
        tech_terms = " ".join([word for word in description.split() 
                             if word.lower() in {'python', 'java', 'aws', 'sql'}])
        
        experience_entry = f"Worked as {position} at {company}"
        if tech_terms:
            experience_entry += f" with focus on {tech_terms}"
        experience.append(experience_entry)
    
    if experience:
        sections.append("Professional Experience: " + ". ".join(experience))
    
    # Skills and certifications with categorization
    skills = resume.get('skills', [])
    if skills:
        sections.append("Technical Skills: " + ", ".join(skills))
    
    certs = resume.get('certifications', [])
    if certs:
        sections.append("Certifications Earned: " + ", ".join(certs))
    
    # Final embedding text
    embedding_text = " ".join(sections)
    
    logger.debug(f"Enhanced embedding text: {embedding_text[:500]}...")
    return embedding_text

def load_resumes():
    """Load resumes from Supabase with enhanced embedding text"""
    try:
        # Fetch resumes
        resumes_response = supabase.table('resumes').select('*').execute()
        resumes = resumes_response.data

        # Fetch profiles
        profiles_response = supabase.table('profiles').select('*').execute()
        profiles = profiles_response.data

        # Join resumes with profiles and ensure all resumes have basic info
        for resume in resumes:
            # Find matching profile
            profile = next((p for p in profiles if p['id'] == resume.get('user_id')), None)
            
            # Add profile data
            if profile:
                first_name = profile.get('first_name', '').strip()
                last_name = profile.get('last_name', '').strip() 
                if first_name or last_name:
                    resume['name'] = f"{first_name} {last_name}".strip()
                else:
                    resume['name'] = f"Candidate {resume.get('user_id', 'Unknown')[:8]}"
                resume['email'] = profile.get('email', '')
                resume['phone'] = profile.get('phone', '')
                resume['address'] = profile.get('address', '')
            else:
                resume['name'] = f"Candidate {resume.get('user_id', 'Unknown')[:8]}"
                
            # Ensure there's always some content in the key fields
            if not resume.get('experience') or not isinstance(resume.get('experience'), list) or len(resume.get('experience', [])) == 0:
                resume['experience'] = [{
                    'position': 'Unspecified Position',
                    'company': 'No company information available',
                    'description': ''
                }]
                
            if not resume.get('education') or not isinstance(resume.get('education'), list) or len(resume.get('education', [])) == 0:
                resume['education'] = [{
                    'degree': 'Unspecified Degree',
                    'institution': 'No institution information available'
                }]
            
            # Ensure skills and other arrays exist
            if not resume.get('skills') or not isinstance(resume.get('skills'), list):
                resume['skills'] = []
                
            if not resume.get('certifications') or not isinstance(resume.get('certifications'), list):
                resume['certifications'] = []
                
            if not resume.get('languages') or not isinstance(resume.get('languages'), list):
                resume['languages'] = []
                

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

        # Add embedding text to resumes
        for resume in resumes:
            resume['embedding_text'] = enhance_resume_embedding(resume)
            
        logger.debug(f"Loaded Resumes: {resumes[:1]}")  # Log first resume
        return resumes
    except Exception as e:
        logger.error(f"Error loading resumes: {str(e)}")
        return []

def validate_resume(resume):
    """Validate required resume fields"""
    required_fields = ['skills', 'experience', 'education', 'user_id', 'embedding']
    return all(field in resume for field in required_fields)

def extract_job_requirements(job_desc):
    """Advanced requirement extraction with tech stack analysis"""
    doc = nlp(job_desc.lower())
    
    requirements = {
        'tech_stack': defaultdict(lambda: {'years': 0, 'priority': 1}),
        'required_skills': [],
        'bonus_skills': [],
        'experience_level': 'mid',
        'responsibilities': []
    }

    # Pattern matching for experience requirements
    for match in nlp(job_desc).ents:
        if match.label_ == 'DATE' and 'year' in match.text:
            # Find associated technology
            for token in match.root.head.children:
                if token.dep_ == 'prep' and token.text == 'in':
                    tech = ' '.join([t.text for t in token.subtree if t.pos_ == 'NOUN'])
                    if tech:
                        requirements['tech_stack'][tech.lower()]['years'] = \
                            int(''.join(filter(str.isdigit, match.text)))

    # Detect skill levels and priorities
    for sent in doc.sents:
        if 'expert' in sent.text or 'senior' in sent.text:
            requirements['experience_level'] = 'senior'
        if 'junior' in sent.text or 'entry-level' in sent.text:
            requirements['experience_level'] = 'junior'
        
        # Detect required skills with context
        for chunk in sent.noun_chunks:
            if 'experience' in chunk.text or 'skill' in chunk.text:
                skill = chunk.text.replace('experience', '').replace('skill', '').strip()
                if skill:
                    requirements['required_skills'].append(skill)

    # Detect bonus skills
    for token in doc:
        if token.text == 'plus' and doc[token.i+1].text == 'in':
            requirements['bonus_skills'] = [t.text for t in doc[token.i+2].subtree if t.pos_ == 'NOUN']

    return requirements

def calculate_enhanced_score(resume, job_embedding, requirements):
    """Advanced scoring with tech-specific experience evaluation"""
    scores = defaultdict(float)
    
    # 1. Tech stack matching
    tech_scores = []
    for tech, req in requirements['tech_stack'].items():
        tech_experience = 0
        # Calculate experience duration for this specific tech
        for exp in resume.get('experience', []):
            if tech in ' '.join(exp.get('skills', [])).lower():
                start = datetime.strptime(exp['start_date'], '%Y-%m-%d')
                end = datetime.strptime(exp['end_date'], '%Y-%m-%d') if exp['end_date'] else datetime.now()
                tech_experience += (end - start).days / 365
                
        # Calculate match quality
        if tech_experience > 0:
            match_ratio = min(tech_experience / req['years'], 2.0)  # Allow over-qualified
            tech_scores.append(match_ratio * req['priority'])
    
    scores['tech_stack'] = sum(tech_scores) / len(tech_scores) if tech_scores else 0

    # 2. Skill context analysis
    skill_context_score = 0
    resume_text = ' '.join([
        f"{exp.get('position', '')} {exp.get('description', '')}" 
        for exp in resume.get('experience', [])
    ]).lower()
    
    for skill in requirements['required_skills']:
        # Count occurrences in meaningful contexts
        skill_count = sum(
            1 for sentence in nlp(resume_text).sents 
            if skill in sentence.text and any(
                token.text in {'develop', 'build', 'lead', 'architect'} 
                for token in sentence
            )
        )
        skill_context_score += min(skill_count * 0.2, 1.0)
    
    scores['skill_context'] = skill_context_score / len(requirements['required_skills']) if requirements['required_skills'] else 0

    # 3. Experience level matching
    total_experience = sum(
        (datetime.strptime(exp['end_date'], '%Y-%m-%d') - 
         datetime.strptime(exp['start_date'], '%Y-%m-%d')).days / 365
        for exp in resume.get('experience', [])
    )
    
    level_multiplier = 1.0
    if requirements['experience_level'] == 'senior' and total_experience >= 5:
        level_multiplier = 1.5
    elif requirements['experience_level'] == 'mid' and 3 <= total_experience < 5:
        level_multiplier = 1.2
    
    # 4. Semantic similarity (existing)
    scores['similarity'] = cosine_similarity([job_embedding], [resume['embedding']])[0][0]

    # Updated weights
    WEIGHTS = {
        'tech_stack': 0.4,
        'skill_context': 0.3,
        'similarity': 0.2,
        'experience_level': 0.1
    }

    return sum(WEIGHTS[k] * scores[k] for k in WEIGHTS)

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

def extract_keywords_and_requirements(text):
    """Extract job requirements using advanced NLP techniques without domain-specific hardcoding"""
    
    # 1. Use NLP to find requirements based on linguistic patterns
    doc = nlp(text.lower())
    
    # Collect noun phrases that follow skill indicators
    skill_indicators = ['experience in', 'knowledge of', 'skilled in', 'proficient with', 
                       'familiar with', 'expertise in', 'background in', 'ability to']
    
    skills = []
    
    # Extract based on skill indicators
    for indicator in skill_indicators:
        idx = text.lower().find(indicator)
        if idx >= 0:
            # Extract a meaningful chunk following the indicator
            end_idx = min(idx + len(indicator) + 100, len(text))
            fragment = text[idx + len(indicator):end_idx]
            fragment_doc = nlp(fragment)
            
            # Get noun phrases (more meaningful than single nouns)
            for chunk in fragment_doc.noun_chunks:
                if len(chunk.text) > 2:
                    skills.append(chunk.text.strip())
    
    # 2. Extract years of experience using regex
    experience_pattern = r'(\d+)[\+]?\s+years?(?:\s+of)?(?:\s+experience)?'
    years_required = re.findall(experience_pattern, text.lower())
    years = max([int(y) for y in years_required]) if years_required else 0
    
    # 3. Use statistical keyword extraction for remaining skills
    # This uses term frequency to identify domain-relevant terms
    # without requiring predefined lists
    
    # Clean text for keyword extraction
    cleaned_text = " ".join([token.lemma_ for token in doc 
                           if not token.is_stop and not token.is_punct])
    
    # Extract keywords using n-grams (1-3 word phrases)
    try:
        # Configure CountVectorizer for keyword extraction
        count_vectorizer = CountVectorizer(
            ngram_range=(1, 3),  # Use 1-3 word phrases
            stop_words='english',
            min_df=1,  # Minimum document frequency
            max_features=50  # Extract top 50 features
        )
        
        # Fit and transform the text
        count_data = count_vectorizer.fit_transform([cleaned_text])
        
        # Get the most common terms
        words = count_vectorizer.get_feature_names_out()
        count_values = count_data.toarray().flatten()
        
        # Create a dictionary of term frequencies
        term_frequencies = dict(zip(words, count_values))
        
        # Sort by frequency and add to skills
        sorted_keywords = sorted(term_frequencies.items(), key=lambda x: x[1], reverse=True)
        for keyword, _ in sorted_keywords[:20]:  # Take top 20
            if len(keyword) > 3 and keyword not in [s.lower() for s in skills]:
                skills.append(keyword)
    
    except Exception as e:
        logger.error(f"Error in keyword extraction: {str(e)}")
    
    # 4. Extract education requirements using dependency parsing - WITH IMPROVED DETECTION
    education_terms = []
    education_mentioned = False  # Flag to track if education is mentioned at all
    education_indicators = ['degree', 'bachelor', 'master', 'phd', 'diploma', 'certification', 'graduated', 'university']
    education_requirement_phrases = ['degree required', 'must have degree', 'education required', 'degree in', 'qualified with']
    
    # First check if any education requirement phrases exist
    if any(phrase in text.lower() for phrase in education_requirement_phrases):
        education_mentioned = True
    
    for sent in doc.sents:
        if any(edu in sent.text.lower() for edu in education_indicators):
            # Found education-related sentence
            education_mentioned = True
            for token in sent:
                if token.text.lower() in education_indicators:
                    # Get the full education requirement phrase
                    phrase = ' '.join([t.text for t in token.subtree])
                    education_terms.append(phrase)
    
    # Find the highest education level mentioned
    education_level = 'none'
    if education_mentioned:
        if any(term for term in education_terms if 'phd' in term.lower() or 'doctor' in term.lower()):
            education_level = 'phd'
        elif any(term for term in education_terms if 'master' in term.lower() or 'msc' in term.lower() or 'ms ' in term.lower()):
            education_level = 'masters'
        elif any(term for term in education_terms if 'bachelor' in term.lower() or 'bs ' in term.lower() or 'ba ' in term.lower()):
            education_level = 'bachelors'
        elif education_terms:  # If other education terms found
            education_level = 'other'
    
    # 5. Extract required languages (human languages, not programming)
    language_entities = [ent.text for ent in doc.ents if ent.label_ == 'LANGUAGE']
    
    # Compile all requirements
    requirements = {
        'skills': list(set(skills)),
        'years_experience': years,
        'education_level': education_level,
        'education_mentioned': education_mentioned,  # New flag to indicate if education was mentioned
        'education_terms': education_terms,
        'languages': language_entities,
        'full_text': text
    }
    
    return requirements

def recommend_resumes(job_desc, resumes, top_n=5):
    """Match resumes to job description using NLP and provide match reasons"""
    try:
        start_time = time.time()
        
        # Extract requirements from job description
        job_requirements = extract_keywords_and_requirements(job_desc)
        logger.info(f"Extracted requirements: {job_requirements}")
        
        # Generate job description embedding for semantic matching
        job_embedding = model.encode(job_desc)
        
        scores = []
        for resume in resumes:
            try:
                if resume.get('embedding') is None or np.size(resume['embedding']) == 0:
                    continue
                
                # 1. Calculate semantic similarity score
                resume_embedding = np.array(resume['embedding'])
                semantic_score = cosine_similarity([job_embedding], [resume_embedding])[0][0]
                
                # 2. Gather match reasons based on requirements
                match_reasons = []
                resume_skills = resume.get('skills', [])
                
                # Add skill matches to reasons
                skill_matches = []
                for resume_skill in resume_skills:
                    for job_skill in job_requirements['skills']:
                        # Check for skill match (case insensitive substring match)
                        if job_skill.lower() in resume_skill.lower() or resume_skill.lower() in job_skill.lower():
                            skill_matches.append(resume_skill)
                            match_reasons.append(f"Has required skill: {resume_skill}")
                            break
                
                # Calculate skill match score
                skill_score = len(skill_matches) / len(job_requirements['skills']) if job_requirements['skills'] else 0
                
                # Check years of experience
                req_years = job_requirements['years_experience']
                candidate_years = calculate_total_experience(resume.get('experience', []))
                
                if req_years > 0 and candidate_years >= req_years:
                    match_reasons.append(f"Has {int(candidate_years)} years of experience (required: {req_years})")
                    experience_score = min(candidate_years / req_years, 1.5)  # Cap at 1.5x
                else:
                    experience_score = min(candidate_years / max(1, req_years), 1.0)
                
                # Check education level - UPDATED LOGIC
                candidate_education = get_highest_education(resume.get('education', []))
                edu_score = calculate_education_score(candidate_education, job_requirements['education_level'])
                
                # Only add education as a match reason if education was explicitly mentioned
                if job_requirements.get('education_mentioned', False) and edu_score > 0.7:
                    for edu in resume.get('education', []):
                        degree = edu.get('degree', 'degree')
                        institution = edu.get('institution', 'institution')
                        match_reasons.append(f"Has {degree} from {institution}")
                        break
                
                # Calculate final score with weights
                final_score = (
                    semantic_score * 0.4 +   # Semantic similarity
                    skill_score * 0.3 +      # Skill match
                    experience_score * 0.2 + # Experience match
                    edu_score * 0.1          # Education match
                )
                
                # Add match reasons and score to resume
                resume_with_reasons = resume.copy()
                resume_with_reasons['match_reasons'] = match_reasons
                resume_with_reasons['score'] = float(final_score)
                
                scores.append((resume_with_reasons, final_score))
                
            except Exception as e:
                logger.error(f"Error scoring resume {resume.get('id')}: {str(e)}")
        
        # Sort by score and return top N
        scores.sort(key=lambda x: x[1], reverse=True)
        
        end_time = time.time()
        logger.info(f"Recommendation took {end_time - start_time:.2f} seconds")
        
        return [resume for resume, _ in scores[:top_n]]
    except Exception as e:
        logger.error(f"Error in recommendation: {str(e)}")
        return []

def calculate_total_experience(experiences):
    """Calculate total years of experience from experience entries"""
    total_years = 0
    for exp in experiences:
        # Handle different formats that might exist in the data
        if 'years' in exp:
            try:
                total_years += float(exp.get('years', 0))
            except (ValueError, TypeError):
                pass
        elif 'start_date' in exp:
            try:
                start = datetime.strptime(exp['start_date'], '%Y-%m-%d')
                end = datetime.strptime(exp.get('end_date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d')
                total_years += (end - start).days / 365
            except (ValueError, TypeError):
                pass
    return total_years

def get_highest_education(education_entries):
    """Determine highest education level from education entries"""
    highest = 'none'
    for edu in education_entries:
        degree = edu.get('degree', '').lower()
        if 'phd' in degree or 'doctor' in degree:
            return 'phd'  # PhD is highest
        elif ('master' in degree or 'msc' in degree or 'ms ' in degree) and highest != 'phd':
            highest = 'masters'
        elif ('bachelor' in degree or 'bs ' in degree or 'ba ' in degree) and highest not in ['phd', 'masters']:
            highest = 'bachelors'
        elif ('associate' in degree or 'diploma' in degree) and highest not in ['phd', 'masters', 'bachelors']:
            highest = 'associate'
    return highest

def calculate_education_score(candidate_edu, required_edu):
    """Calculate how well candidate's education matches requirements"""
    edu_levels = {
        'phd': 5,
        'masters': 4, 
        'bachelors': 3,
        'associate': 2,
        'other': 1,
        'none': 0
    }
    candidate_level = edu_levels.get(candidate_edu, 0)
    required_level = edu_levels.get(required_edu, 0)
    
    # Perfect or overqualified
    if candidate_level >= required_level:
        return 1.0
    # Underqualified but has education
    elif candidate_level > 0:
        return candidate_level / required_level
    # No education when some is required
    else:
        return 0.0

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