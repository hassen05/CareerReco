# recommender/import_resumes.py
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from .models import Resume

def import_new_data():
    model = SentenceTransformer('all-MiniLM-L6-v2')
    df = pd.read_csv('resumes.csv')  # Replace with your new dataset
    
    for _, row in df.iterrows():
        # Handle the ID if your CSV has a custom "id" column
        resume_id = row.get('id', None)  # Use this if your CSV has an "id" field
        
        # Combine text fields for embedding
        text = f"{row['skills']} {row['experience']} {row['education']}"
        embedding = model.encode(text)
        
        # Create or update Resume object
        Resume.objects.update_or_create(
            id=resume_id,  # Only include this if your CSV has an explicit "id" column
            defaults={
                "name": row['name'],
                "email": row['email'],
                "skills": row['skills'],
                "experience": row['experience'],
                "education": row['education'],
                "certifications": row.get('certifications', ''),
                "embedding": np.asarray(embedding).astype(np.float32).tobytes()
            }
        )
    print("Data imported successfully!")