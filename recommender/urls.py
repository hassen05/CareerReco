from django.urls import path
from .views import RecommendAPI, ResumeListAPI, ResumeDetailAPI, ProfileAPI, save_to_mongodb
from .auth_views import SignUpView, LoginView

urlpatterns = [
    path('recommend/', RecommendAPI.as_view(), name='recommend-api'),
    path('resumes/', ResumeListAPI.as_view(), name='resume-list'),
    path('resumes/<str:resume_id>/', ResumeDetailAPI.as_view(), name='resume-detail'),
    path('auth/signup/', SignUpView.as_view(), name='signup'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('profile/<str:user_id>/', ProfileAPI.as_view(), name='profile-api'),
    path('save-resume/', save_to_mongodb, name='save_to_mongodb'),
]