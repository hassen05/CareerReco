from rest_framework.views import APIView
from rest_framework.response import Response
from .utils import load_resumes, recommend_resumes, enhance_resume_embedding, extract_keywords_and_requirements
from .serializers import ResumeSerializer
import logging
from .models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
from supabase import create_client
import os
from sentence_transformers import SentenceTransformer
import numpy as np
import base64

logger = logging.getLogger('recommender')

class RecommendAPI(APIView):
    def post(self, request):
        try:
            logger.info(f"Received request data: {request.data}")
            job_desc = request.data.get("job_description", "")
            top_n = request.data.get("top_n", 5)
            
            resumes = load_resumes()
            
            # Filter only resumes with valid embeddings
            valid_resumes = [r for r in resumes if r.get('embedding') is not None and np.size(r['embedding']) > 0]
            logger.info(f"Processing {len(valid_resumes)} resumes with valid embeddings")
            
            # Get recommendations with enhanced algorithm that extracts requirements from job description
            recommended = recommend_resumes(job_desc, valid_resumes, top_n)
            
            logger.info({
                'event': 'recommendation_request',
                'user_id': getattr(request.user, 'id', None),
                'params': request.data
            })
            return Response(recommended)
        except Exception as e:
            logger.error(f'Error in recommendation: {str(e)}')
            return Response({"error": str(e)}, status=500)

def get_match_reasons(resume, job_desc):
    """Generate human-readable reasons for the match"""
    reasons = []
    
    # Extract job requirements
    job_requirements = extract_keywords_and_requirements(job_desc)
    
    # Identify top skills matches
    resume_skills = set(s.lower() for s in resume.get('skills', []))
    job_skills = set(s.lower() for s in job_requirements['skills'])
    
    if job_skills and resume_skills:
        matching_skills = resume_skills.intersection(job_skills)
        if matching_skills:
            if len(matching_skills) >= 3:
                reasons.append(f"Has {len(matching_skills)} required skills including {', '.join(list(matching_skills)[:3])}")
            else:
                reasons.append(f"Has required skills: {', '.join(matching_skills)}")
    
    # Check education match - ONLY IF MENTIONED IN JOB DESC
    if job_requirements.get('education_mentioned', False):
        edu_level = job_requirements['education_level']
        if edu_level != 'none':
            for edu in resume.get('education', []):
                institution = edu.get('institution', '')
                degree = edu.get('degree', '')
                
                # Only add if there's an actual match with the requirement
                if (edu_level == 'phd' and ('phd' in degree.lower() or 'doctor' in degree.lower())) or \
                   (edu_level == 'masters' and ('master' in degree.lower() or 'msc' in degree.lower())) or \
                   (edu_level == 'bachelors' and ('bachelor' in degree.lower() or 'bs ' in degree.lower() or 'ba ' in degree.lower())):
                    reasons.append(f"Has required {edu_level} degree from {institution}")
                    break
    
    # Check experience
    min_years = job_requirements['experience_years']
    if min_years > 0:
        total_exp = 0
        for exp in resume.get('experience', []):
            if 'start_date' in exp and 'end_date' in exp:
                try:
                    start = datetime.strptime(exp['start_date'], '%Y-%m-%d')
                    end_date = exp['end_date'] or datetime.now().strftime('%Y-%m-%d')
                    end = datetime.strptime(end_date, '%Y-%m-%d')
                    years = (end - start).days / 365
                    total_exp += years
                except:
                    pass
        
        if total_exp >= min_years:
            reasons.append(f"Has {int(total_exp)} years of experience (job requires {min_years})")
    
    return reasons[:3]  # Return top 3 reasons

class ProfileAPI(APIView):
    def get(self, request, user_id):
        try:
            supabase = create_client(
                os.getenv("SUPABASE_URL"),
                os.getenv("SUPABASE_KEY")
            )
            
            # Fetch profile
            profile_response = supabase.table('profiles') \
                .select('*') \
                .eq('id', user_id) \
                .single() \
                .execute()
                
            profile = profile_response.data
            
            # Fetch associated resume
            resume_response = supabase.table('resumes') \
                .select('*') \
                .eq('user_id', user_id) \
                .single() \
                .execute()
                
            resume = resume_response.data
            
            return Response({
                'profile': profile,
                'resume': resume
            })
            
        except Exception as e:
            logger.error(f"Error fetching profile {user_id}: {str(e)}")
            return Response({"error": "Profile not found"}, status=404)

def create_or_update_profile(user, profile_data):
    # Update or create profile in Supabase
    supabase = create_client(
        url=os.getenv("SUPABASE_URL"),
        key=os.getenv("SUPABASE_ANON_KEY"),
    )
    supabase.table('profiles').upsert({
        'id': user.id,
        'first_name': profile_data.get('first_name', ''),
        'last_name': profile_data.get('last_name', ''),
        'profile_picture': profile_data.get('profile_picture', ''),
        'bio': profile_data.get('bio', ''),
        'website': profile_data.get('website', ''),
        'linkedin': profile_data.get('linkedin', ''),
        'github': profile_data.get('github', ''),
        'twitter': profile_data.get('twitter', ''),
        'updated_at': datetime.now().isoformat()
    }).execute()

def get_profile(user_id):
    response = supabase.table('profiles') \
        .select('*') \
        .eq('id', user_id) \
        .single() \
        .execute()
    
    if response.data:
        return response.data
    return None

class GenerateEmbeddingAPI(APIView):
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def post(self, request):
        try:
            resume_data = request.data.get("resume_data")
            
            # Validate resume data
            if not resume_data:
                return Response({"error": "Resume data is required"}, status=400)
            
            # Generate enhanced embedding text
            embedding_text = enhance_resume_embedding(resume_data)
            
            # Compute embedding
            embedding = self.model.encode(embedding_text).astype("float32").tobytes()
            
            # Encode as Base64
            embedding_base64 = base64.b64encode(embedding).decode('utf-8')
            
            return Response({"embedding": embedding_base64}, status=200)
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            return Response({"error": "Failed to generate embedding"}, status=500)

    def calculate_experience_duration(self, experience):
        """Calculate experience duration handling current positions"""
        try:
            start_date = experience.get('start_date')
            end_date = experience.get('end_date')
            
            if not start_date:
                return 0
            
            start = datetime.strptime(start_date, '%Y-%m-%d')
            end = datetime.now() if not end_date else datetime.strptime(end_date, '%Y-%m-%d')
            
            # Calculate months difference for more accuracy
            months = (end.year - start.year) * 12 + (end.month - start.month)
            return round(months / 12, 1)  # Convert months to years
        
        except Exception as e:
            logger.error(f"Error calculating experience: {str(e)}")
            return 0