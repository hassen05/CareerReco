from django.urls import path
from .views import RecommendAPI, ProfileAPI, GenerateEmbeddingAPI, LLMRecommendAPI
from .auth_views import SignUpView, LoginView

urlpatterns = [
    path('recommend/', RecommendAPI.as_view(), name='recommend-api'),
    path('recommend/llm/', LLMRecommendAPI.as_view(), name='llm-recommend-api'),
    path('auth/signup/', SignUpView.as_view(), name='signup'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('profile/<str:user_id>/', ProfileAPI.as_view(), name='profile-api'),
    path('generate-embedding/', GenerateEmbeddingAPI.as_view(), name='generate-embedding'),
]