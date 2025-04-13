import os
from dotenv import load_dotenv
load_dotenv()

# Test environment variables
print("Testing environment variables...")
print(f"OPENROUTER_API_KEY: {'✓ Set' if os.getenv('OPENROUTER_API_KEY') else '✗ Not set'}")

# If Django settings are available, test those too
try:
    import django
    from django.conf import settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'resume_recommender.settings')
    django.setup()
    
    print(f"\nDjango settings...")
    print(f"OPENROUTER_API_KEY from settings: {'✓ Set' if hasattr(settings, 'OPENROUTER_API_KEY') and settings.OPENROUTER_API_KEY else '✗ Not set'}")
    
    if hasattr(settings, 'OPENROUTER_API_KEY') and settings.OPENROUTER_API_KEY:
        # Print first few chars of key to verify
        print(f"Key starts with: {settings.OPENROUTER_API_KEY[:10]}...")
except Exception as e:
    print(f"Error loading Django settings: {e}")
