import os
import traceback
import sys
import requests
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables directly from the .env file
load_dotenv(dotenv_path=".env", override=True)

# Get API key from .env file
with open(".env", "r") as f:
    env_contents = f.read()

# Find the specific line with OPENROUTER_API_KEY
for line in env_contents.split("\n"):
    if line.startswith("OPENROUTER_API_KEY="):
        OPENROUTER_API_KEY = line.split("=", 1)[1].strip()
        break
else:
    OPENROUTER_API_KEY = ""

print(f"API key from .env file: {OPENROUTER_API_KEY}")
print(f"API Key available: {'Yes' if OPENROUTER_API_KEY else 'No'}")
print(f"API Key length: {len(OPENROUTER_API_KEY)}")
print(f"Last 4 characters: {OPENROUTER_API_KEY[-4:] if OPENROUTER_API_KEY else 'None'}")

try:
    # Initialize OpenRouter client
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
        default_headers={
            "HTTP-Referer": "https://careerreco.app",
            "X-Title": "CareerReco API Test"
        }
    )
    
    print("\nMaking API request to OpenRouter...")
    
    print(f"Authorization: Bearer {OPENROUTER_API_KEY[:5]}...{OPENROUTER_API_KEY[-4:]}")

    # Try with direct request instead
    api_url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "https://careerreco.app",
        "X-Title": "CareerReco API Test"
    }

    payload = {
        "model": "meta-llama/llama-4-maverick:free",
        "messages": [
            {
                "role": "user",
                "content": "What are the key skills needed for a data scientist position?"
            }
        ],
        "max_tokens": 150
    }

    print("\nSending direct API request...")
    response = requests.post(api_url, headers=headers, json=payload)
    print(f"Response status code: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print("\nAPI request successful!")
        print(f"Model used: {result.get('model', 'Unknown')}")
        print(f"Response: {result.get('choices', [{}])[0].get('message', {}).get('content', 'No content')}")
    else:
        print(f"Error response: {response.text}")

    # Also try with OpenAI client
    print("\nAlso trying with OpenAI client...")
    completion = client.chat.completions.create(
        model="meta-llama/llama-4-maverick:free",
        messages=[
            {
                "role": "user",
                "content": "What are the key skills needed for a data scientist position?"
            }
        ],
        max_tokens=150
    )
    
    # Print the response
    print("\nAPI Response:")
    print(f"Model used: {completion.model}")
    print(f"Response content: {completion.choices[0].message.content}")
    print("\nAPI test successful!")
    
except Exception as e:
    print(f"\nError occurred: {str(e)}")
    print("\nFull traceback:")
    traceback.print_exc()
    
    # Show more details about the error
    if hasattr(e, 'response'):
        print(f"\nResponse status: {e.response.status_code if hasattr(e.response, 'status_code') else 'N/A'}")
        print(f"Response body: {e.response.text if hasattr(e.response, 'text') else 'N/A'}")
        
    print("\nCheck your API key and connection settings.")
