from rest_framework.views import APIView
from rest_framework.response import Response
from .utils import load_resumes, recommend_resumes
from .serializers import ResumeSerializer
import logging

logger = logging.getLogger('recommender')

class RecommendAPI(APIView):
    def post(self, request):
        try:
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