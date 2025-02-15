from rest_framework.views import APIView
from rest_framework.response import Response
from .utils import load_resumes, recommend_resumes
from .serializers import ResumeSerializer
import logging
from resume_recommender.settings import mongo_db
from rest_framework import status

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