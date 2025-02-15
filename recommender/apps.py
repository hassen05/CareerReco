from django.apps import AppConfig
from pymongo import MongoClient


class RecommenderConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "recommender"

    def ready(self):
        # Connect to MongoDB
        client = MongoClient("mongodb://localhost:27017/")
        db = client["resumerec"]

        # Create indexes
        db.resumes.create_index([("skills", 1)])
        db.resumes.create_index([("experience.position", 1)])
        db.resumes.create_index([("education", 1)])
