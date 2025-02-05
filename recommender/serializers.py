from rest_framework import serializers
from datetime import date

class ResumeSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()
    education = serializers.CharField()
    skills = serializers.ListField(child=serializers.CharField())
    experience = serializers.ListField()
    languages = serializers.ListField(child=serializers.CharField())
    certifications = serializers.ListField(child=serializers.CharField())
    age = serializers.SerializerMethodField()  # Calculated field
    score = serializers.FloatField()

    def get_age(self, obj):
        dob = date.fromisoformat(obj['dob'])
        today = date.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))