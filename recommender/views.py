from rest_framework.views import APIView
from rest_framework.response import Response
from .utils import load_resumes, recommend_resumes
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
            logger.info(f"Received request data: {request.data}")  # Debug
            job_desc = request.data.get("job_description", "")
            top_n = request.data.get("top_n", 5)
            resumes = load_resumes()
            recommendations = recommend_resumes(job_desc, resumes, top_n)
            
            # Add score to each resume
            recommended_resumes = []
            for resume, score in recommendations:
                resume['score'] = score
                recommended_resumes.append(resume)
            
            # Serialize the recommendations
            serializer = ResumeSerializer(recommended_resumes, many=True)
            
            # Log the response data
            logger.debug(f"API Response: {serializer.data}")
            
            logger.info({
                'event': 'recommendation_request',
                'user_id': request.user.id,
                'params': request.data
            })
            return Response(serializer.data)
        except Exception as e:
            logger.error(f'Error in recommendation: {str(e)}')
            return Response({"error": "An error occurred while processing the recommendation request."}, status=500)

class ProfileAPI(APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.get(supabase_id=user_id)
            profile = user.profile
            
            # Check visibility
            if profile.visibility == 'private' and not request.user.is_authenticated:
                return Response(
                    {'error': 'This profile is private'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            profile_data = {
                'id': user.id,
                'first_name': profile.first_name,
                'last_name': profile.last_name,
                'email': user.email,
                'profile_picture': profile.profile_picture,
                'bio': profile.bio,
                'website': profile.website,
                'linkedin': profile.linkedin,
                'github': profile.github,
                'twitter': profile.twitter,
                'visibility': profile.visibility,
                'completeness': profile.completeness
            }
            return Response(profile_data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content_type='application/json'
            )

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
            
            # Log the received resume data for debugging
            logger.debug(f"Received resume data: {resume_data}")
            
            # Validate resume data
            if not resume_data:
                logger.error("No resume data provided")
                return Response({"error": "Resume data is required"}, status=400)
            
            # Generate embedding text using enhanced logic
            try:
                # Handle education field
                education = resume_data.get('education', [])
                if isinstance(education, dict):
                    # Convert single education object to array
                    education = [education]
                elif not isinstance(education, list):
                    logger.error(f"Education field is invalid type: {type(education)}")
                    return Response({"error": "Education must be an object or array"}, status=400)
                
                # Extract degree and institute from education
                education_text = ' '.join(
                    f"{edu.get('degree', '')} {edu.get('institution', '')}" 
                    for edu in education
                )
                logger.debug(f"Education text: {education_text}")
                
                # Handle skills field
                skills = resume_data.get('skills', [])
                if not isinstance(skills, list):
                    logger.error(f"Skills field is not a list: {skills}")
                    return Response({"error": "Skills field must be a list"}, status=400)
                skills_text = ' '.join(skills)
                logger.debug(f"Skills text: {skills_text}")
                
                # Handle experience field
                experience = resume_data.get('experience', [])
                if not isinstance(experience, list):
                    logger.error(f"Experience field is not a list: {experience}")
                    return Response({"error": "Experience field must be a list"}, status=400)
                experience_text = ' '.join(
                    f"{exp.get('position', '')} at {exp.get('company', '')} for {self.calculate_experience_duration(exp)} years"
                    for exp in experience
                )
                logger.debug(f"Experience text: {experience_text}")
                
                # Handle languages field
                languages = resume_data.get('languages', [])
                if not isinstance(languages, list):
                    logger.error(f"Languages field is not a list: {languages}")
                    return Response({"error": "Languages field must be a list"}, status=400)
                languages_text = ' '.join(languages)
                logger.debug(f"Languages text: {languages_text}")
                
                # Handle certifications field
                certifications = resume_data.get('certifications', [])
                if not isinstance(certifications, list):
                    logger.error(f"Certifications field is not a list: {certifications}")
                    return Response({"error": "Certifications field must be a list"}, status=400)
                certifications_text = ' '.join(certifications)
                logger.debug(f"Certifications text: {certifications_text}")
                
                # Combine all fields into embedding text
                embedding_text = (
                    f"{education_text} {skills_text} {experience_text} "
                    f"{languages_text} {certifications_text}"
                )
                
                # Log the generated embedding text
                logger.debug(f"Generated embedding text: {embedding_text}")
                
                # Compute embedding
                embedding = self.model.encode(embedding_text).astype("float32").tobytes()
                
                # Encode embedding as Base64
                embedding_base64 = base64.b64encode(embedding).decode('utf-8')
                
                return Response({"embedding": embedding_base64}, status=200)
            except Exception as e:
                logger.error(f"Error generating embedding text: {str(e)}")
                return Response({"error": "Failed to generate embedding text"}, status=500)
        except Exception as e:
            logger.error(f"Error in GenerateEmbeddingAPI: {str(e)}")
            return Response({"error": "An error occurred while processing the request"}, status=500)

    def calculate_experience_duration(self, experience):
        """Calculate the duration of experience in years based on start_date and end_date."""
        try:
            start_date = experience.get('start_date')
            end_date = experience.get('end_date')
            
            if not start_date:
                return 0  # If no start date, assume 0 years of experience
            
            # Parse start_date
            start = datetime.strptime(start_date, '%Y-%m-%d')
            
            # If end_date is not provided, use the current date
            end = datetime.strptime(end_date, '%Y-%m-%d') if end_date else datetime.now()
            
            # Calculate duration in years
            duration = (end - start).days / 365.25
            return round(duration, 1)  # Round to 1 decimal place
        except Exception as e:
            logger.error(f"Error calculating experience duration: {str(e)}")
            return 0  # Return 0 if there's an error