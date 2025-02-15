from rest_framework import serializers
from datetime import date

class ResumeSerializer(serializers.Serializer):
    id = serializers.CharField(source="resume.id")
    name = serializers.CharField(source="resume.name")
    email = serializers.EmailField(source="resume.email")
    phone = serializers.CharField(source="resume.phone")
    address = serializers.CharField(source="resume.address")
    education = serializers.CharField(source="resume.education")
    skills = serializers.ListField(child=serializers.CharField(), source="resume.skills")
    experience = serializers.ListField(source="resume.experience")
    languages = serializers.ListField(child=serializers.CharField(), source="resume.languages")
    dob = serializers.CharField(source="resume.dob")
    certifications = serializers.ListField(child=serializers.CharField(), source="resume.certifications")
    score = serializers.FloatField()

    def get_age(self, obj):
        dob = date.fromisoformat(obj["resume"]["dob"])
        today = date.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))