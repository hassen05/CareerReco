from django.db import models
import uuid
class Resume(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    skills = models.TextField()
    experience = models.TextField()
    education = models.TextField()
    certifications = models.TextField()
    # Add embedding field
    embedding = models.BinaryField(null=True, blank=True)  # Store embeddings as bytes

    def __str__(self):
        return self.name