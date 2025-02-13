from django.db import models

class RecommendationFeedback(models.Model):
    resume_id = models.CharField(max_length=36)
    job_description = models.TextField()
    score = models.FloatField()
    feedback = models.IntegerField()  # 1 for positive, 0 for negative
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['resume_id']),
            models.Index(fields=['created_at'])
        ]