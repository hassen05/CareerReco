# ResumeRec - AI-Powered Recruitment Platform

## Project Overview
ResumeRec is an innovative AI-powered recruitment platform designed to revolutionize the hiring process. It connects organizations with their ideal candidates while eliminating bias and reducing time-to-hire. The platform leverages cutting-edge AI technology to provide smart recommendations and streamline the recruitment workflow.

## Key Features

### For Job Seekers
- **AI-Powered Job Matching**: Intelligent algorithms match candidates with relevant job opportunities
- **Professional Profile Creation**: Create and maintain a comprehensive professional profile
- **Increased Visibility**: Enhanced exposure to recruiters and hiring managers
- **Resume Analysis**: Get insights and suggestions for improving your resume

### For Recruiters
- **Advanced Candidate Search**: Powerful search tools to find the perfect candidates
- **AI Recommendations**: Smart suggestions based on job requirements
- **Large Talent Database**: Access to a vast pool of qualified candidates
- **Efficient Screening**: Automated resume screening and ranking

## Technology Stack

### Frontend
- React.js with Material-UI components
- Framer Motion for animations
- React Router for navigation
- Axios for API communication

### Backend
- Python with Django REST framework
- Machine learning models for resume analysis and matching
- Supabase for authentication and data storage
- Vector embeddings for semantic search

### AI/ML Components
- Natural Language Processing (NLP) for resume parsing
- Recommendation algorithms for candidate matching
- Sentiment analysis for candidate evaluation
- Bias detection and mitigation algorithms

## Database Architecture

### Authentication and Storage with Supabase
We use Supabase for user management and data storage with the following schema:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  bio TEXT,
  profile_picture TEXT, -- URL to the profile picture in Supabase Storage
  company TEXT,
  job_title TEXT,
  website TEXT,
  linkedin TEXT,
  github TEXT,
  twitter TEXT,
  role TEXT CHECK (role IN ('candidate', 'recruiter')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  education JSONB,
  skills TEXT[],
  experience JSONB,
  languages TEXT[],
  certifications TEXT[],
  embedding VECTOR(384),
  embedding_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Strategic Enhancements Roadmap

### 1. Interactive Dashboard
A personalized dashboard for both candidates and recruiters showing:

- Job application status tracker
- Recent activity feed 
- Key metrics (profile views, application success rate)
- Recommended actions to improve profile/job listings

### 2. AI Interview Preparation
- Mock interview simulator with AI feedback
- Common questions for specific roles
- Real-time feedback on answers
- Video recording capabilities for self-review

### 3. Smart Job Matching for Candidates
- Personalized job recommendations based on candidate profiles
- "Job fit score" showing match percentage
- Skill gap analysis with learning resources
- Customizable job alerts

### 4. In-Platform Messaging System
- Secure messaging between candidates and recruiters
- Interview scheduling capabilities
- Template messages for common scenarios
- Read receipts and typing indicators

### 5. Career Progression Tools
- Skill development tracking
- Career path visualization
- Personalized learning recommendations
- Salary insights and negotiation tips

### 6. Advanced Analytics for Recruiters
- Candidate pipeline visualization
- Time-to-hire metrics
- Source effectiveness analysis
- Team performance dashboards

### 7. Community and Networking Features
- Industry forums and discussion groups
- Peer resume reviews
- Mentorship matching
- Virtual networking events

### 8. Mobile Application
- Native mobile experience for on-the-go access
- Push notifications for job matches and messages
- Easy document uploads from mobile devices
- Interview reminders and calendar integration

## Technical Improvement Priorities

### 1. Improved Search Functionality
- Vector database integration for semantic search
- Advanced filtering options with weighted parameters
- Search query optimization for faster results

### 2. Performance Optimization
- Server-side rendering for faster initial loads
- Implement caching strategies for recommendation engine
- Lazy loading for performance-intensive components

### 3. Enhanced Security
- Two-factor authentication
- Document encryption for sensitive resume data
- Compliance tooling for GDPR/CCPA

## Environment Variables
Update the `.env` file to include Supabase credentials and storage bucket name:
```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_STORAGE_BUCKET=avatars
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Installation and Setup

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   ```bash
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the server:
   ```bash
   python manage.py runserver
   ```

## API Documentation
The backend API is documented using Django REST framework's built-in API documentation. After starting the backend server, access the documentation at:
```
http://localhost:8000/api/docs/
```

## Testing
Run tests for both frontend and backend:

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
python manage.py test
```

## Deployment
The application can be deployed using Docker containers. A `docker-compose.yml` file is provided for easy deployment.

1. Build and start containers:
   ```bash
   docker-compose up --build
   ```

2. Access the application at:
   ```
   http://localhost:3000
   ```

## Future Enhancements
- Integration with LinkedIn and other professional networks
- Video interview analysis using AI
- Advanced analytics dashboard for recruiters
- Mobile application development
- Multi-language support

## Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeatureName`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeatureName`)
5. Open a pull request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
For any inquiries, please contact the project team through GitHub issues. 