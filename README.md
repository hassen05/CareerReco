# Resume Recommendation System

A web application that recommends the best resumes for a given job description using semantic similarity and NLP. Built with React for the frontend and Django for the backend, this system leverages the sentence-transformers library to match job descriptions with resumes.

## Features
- **Semantic Search**: Uses `sentence-transformers` to match job descriptions with resumes.
- **Automatic Filtering**: Automatically extracts and filters the given description.
- **Dynamic Recommendations**: Users can specify the number of recommendations.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hassen05/CareerReco

2. Set up a virtual environment:
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate

3. Install dependencies:
    pip install -r requirements.txt
    python -m spacy download fr_core_news_sm

4. Set up the database:
    python manage.py makemigrations recommender
    python manage.py migrate

5. Run the server:
    python manage.py runserver
7. Install frontend dependencies:

    Navigate to the frontend directory:
        cd frontend
    Install dependencies:
        npm install
8. Run the frontend server:
    npm start
9. Access the application:

    Open your browser and navigate to http://localhost:3000.