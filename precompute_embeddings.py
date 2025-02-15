import numpy as np
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient

# Load the model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["resumerec"]
resumes_collection = db["resumes"]

# Precompute embeddings
for resume in resumes_collection.find():
    # Generate embedding text
    embedding_text = f"{resume['education']} {' '.join(resume['skills'])}"
    
    # Compute embedding
    embedding = model.encode(embedding_text).astype("float32").tobytes()
    
    # Update the resume with the embedding
    resumes_collection.update_one({"_id": resume["_id"]}, {"$set": {"embedding": embedding}})

print("Embeddings precomputed and stored in MongoDB.") 