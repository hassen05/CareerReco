from rest_framework.views import APIView
from rest_framework.response import Response
from .utils import load_resumes, recommend_resumes, enhance_resume_embedding
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
            
            # Filter resumes with valid embeddings
            valid_resumes = [r for r in resumes if r.get('embedding') is not None and np.size(r['embedding']) > 0]
            logger.info(f"Processing {len(valid_resumes)} resumes with valid embeddings")
            
            recommended = recommend_resumes(job_desc, valid_resumes, top_n)
            
            # Convert numpy arrays to lists and add score
            recommended_resumes = []
            for resume, score in recommended:
                # Convert numpy embedding to list
                if isinstance(resume['embedding'], np.ndarray):
                    resume['embedding'] = resume['embedding'].tolist()
                resume['score'] = float(score)
                resume['user_id'] = resume['user_id']
                recommended_resumes.append(resume)
            
            # Serialize the recommendations
            serializer = ResumeSerializer(recommended_resumes, many=True)
            
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