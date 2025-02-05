from rest_framework.views import APIView
from rest_framework.response import Response
from .utils import load_resumes, recommend_resumes
from .serializers import ResumeSerializer

class RecommendAPI(APIView):
    def post(self, request):
        job_desc = request.data.get("job_description", "")
        top_n = request.data.get("top_n", 5)
        resumes = load_resumes()
        recommendations = recommend_resumes(job_desc, resumes, top_n)
        serializer = ResumeSerializer(recommendations, many=True)
        return Response(serializer.data)