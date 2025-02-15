from django.urls import path
from .views import RecommendAPI, ResumeListAPI, ResumeDetailAPI

urlpatterns = [
    path('recommend/', RecommendAPI.as_view(), name='recommend-api'),
    path('resumes/', ResumeListAPI.as_view(), name='resume-list'),
    path('resumes/<str:resume_id>/', ResumeDetailAPI.as_view(), name='resume-detail'),
]