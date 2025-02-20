from django.db import models
from djongo import models as djongo_models

class RecommendationFeedback(models.Model):
    resume_id = models.CharField(max_length=36)
    job_description = models.TextField()
    score = models.FloatField()
    feedback = models.IntegerField()  # 1 for positive, 0 for negative

    class Meta:
        indexes = [
            models.Index(fields=['resume_id']),
        ]

class Resume(djongo_models.Model):
    id = djongo_models.CharField(max_length=36, primary_key=True)
    name = djongo_models.CharField(max_length=100)
    email = djongo_models.EmailField()
    phone = djongo_models.CharField(max_length=20)
    address = djongo_models.TextField()
    education = djongo_models.CharField(max_length=200)
    skills = djongo_models.JSONField(default=list)
    experience = djongo_models.JSONField(default=list)
    languages = djongo_models.JSONField(default=list)
    dob = djongo_models.CharField(max_length=10)  # YYYY-MM-DD format
    certifications = djongo_models.JSONField(default=list)
    embedding = djongo_models.BinaryField()
    createdAt = djongo_models.DateTimeField(default="2025-02-15T00:00:00Z")
    updatedAt = djongo_models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resumes"

class User(djongo_models.Model):
    _id = djongo_models.ObjectIdField()
    supabase_id = djongo_models.CharField(max_length=255, unique=True)  # Supabase user ID
    email = djongo_models.EmailField(unique=True)
    role = djongo_models.CharField(max_length=20, choices=[("candidate", "Candidate"), ("recruiter", "Recruiter")])
    profile = djongo_models.JSONField(default=dict)
    created_at = djongo_models.DateTimeField(auto_now_add=True)
    updated_at = djongo_models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users"

class Profile(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name='user_profile'
    )
    bio = models.TextField(blank=True)
    website = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    @property
    def completeness(self):
        required_fields = [
            'first_name', 'last_name', 'profile_picture', 'bio'
        ]
        completed = 0
        
        for field in required_fields:
            if getattr(self, field):
                completed += 1
                
        return int((completed / len(required_fields)) * 100)