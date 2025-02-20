from rest_framework.views import APIView
from rest_framework.response import Response
from .utils import load_resumes, recommend_resumes
from .serializers import ResumeSerializer
import logging
from resume_recommender.settings import mongo_db
from rest_framework import status
from .models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pymongo import MongoClient
import json
from datetime import datetime
from supabase import create_client
import os

logger = logging.getLogger('recommender')

class RecommendAPI(APIView):
    def post(self, request):
        try:
            logger.info(f"Received request data: {request.data}")  # Debug
            job_desc = request.data.get("job_description", "")
            top_n = request.data.get("top_n", 5)
            resumes = load_resumes()
            recommendations = recommend_resumes(job_desc, resumes, top_n)
            serializer = ResumeSerializer(recommendations, many=True)
            logger.info({
                'event': 'recommendation_request',
                'user_id': request.user.id,
                'params': request.data
            })
            return Response(serializer.data)
        except Exception as e:
            logger.error(f'Error in recommendation: {str(e)}')
            return Response({"error": "An error occurred while processing the recommendation request."}, status=500)

class ResumeListAPI(APIView):
    def get(self, request):
        resumes_collection = mongo_db["resumes"]
        resumes = list(resumes_collection.find())
        return Response(resumes, status=status.HTTP_200_OK)

class ResumeDetailAPI(APIView):
    def get(self, request, resume_id):
        resumes_collection = mongo_db["resumes"]
        resume = resumes_collection.find_one({"_id": resume_id})
        if resume:
            return Response(resume, status=status.HTTP_200_OK)
        return Response({"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)

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

@csrf_exempt
def save_to_mongodb(request):
    if request.method == 'POST':
        try:
            client = MongoClient('mongodb://localhost:27017')
            db = client['ProjetDS']
            collection = db['resumes']
            
            data = json.loads(request.body)
            
            # Update if exists, insert if not
            result = collection.update_one(
                {'userId': data['userId']},
                {'$set': data},
                upsert=True
            )
            
            return JsonResponse({
                'status': 'success',
                'matched_count': result.matched_count,
                'modified_count': result.modified_count,
                'upserted_id': str(result.upserted_id) if result.upserted_id else None
            }, status=201)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

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