from django.urls import path
from .views import RecommendAPI

urlpatterns = [
    path('recommend/', RecommendAPI.as_view(), name='recommend-api'),
]