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
- Python with FastAPI framework
- Machine learning models for resume analysis and matching
- PostgreSQL database
- Redis for caching

### AI/ML Components
- Natural Language Processing (NLP) for resume parsing
- Recommendation algorithms for candidate matching
- Sentiment analysis for candidate evaluation
- Bias detection and mitigation algorithms

## Database Architecture

### Resume Database
- **MongoDB**: Chosen for its flexibility in handling unstructured resume data
- **Current Data Structure** (from merged_resumes.json):
```json
{
  "id": String,
  "name": String,
  "email": String,
  "phone": String,
  "address": String,
  "education": String,
  "skills": [String],
  "experience": [
    {
      "company": String,
      "position": String,
      "years": Number,
      "responsibilities": [String]
    }
  ],
  "languages": [String],
  "dob": String, // Date in YYYY-MM-DD format
  "certifications": [String]
}
```

### Recommended MongoDB Schema
```javascript
{
  _id: ObjectId,
  personalInfo: {
    name: String,
    email: { type: String, unique: true },
    phone: String,
    address: String,
    dob: Date
  },
  education: String,
  skills: [String],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    responsibilities: [String]
  }],
  languages: [String],
  certifications: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Authentication with Supabase
We'll use Supabase Auth for user management with the following schema:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  profile_picture TEXT, -- URL to the profile picture in Supabase Storage
  role TEXT CHECK (role IN ('candidate', 'recruiter')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Integration Strategy
1. **Profile Picture Storage**:
   - Use Supabase Storage for profile pictures
   - Store the URL in the Supabase profiles table
   - Implement image upload endpoint using Supabase Storage API

2. **Data Relationships**:
   - Link resumes to users via Supabase user ID
   - Add reference to user in resume documents:
     ```javascript
     {
       _id: ObjectId,
       userId: String, // Supabase user ID
       ... // rest of resume fields
     }
     ```

3. **Search Optimization**:
   - Implement text indexes for full-text search in MongoDB:
     ```javascript
     db.resumes.createIndex({
       'personalInfo.name': 'text',
       skills: 'text',
       'experience.position': 'text'
     })
     ```

4. **Data Security**:
   - Use Supabase Auth for secure authentication
   - Implement field-level encryption for sensitive data in MongoDB
   - Use MongoDB's built-in access control
   - Enable auditing for data access tracking

## Environment Variables
Update the `.env` file to include Supabase credentials and storage bucket name:
```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_STORAGE_BUCKET=profile-pictures
MONGO_URI=mongodb://localhost:27017/resumerec
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
   uvicorn main:app --reload
   ```

## API Documentation
The backend API is documented using Swagger UI. After starting the backend server, access the documentation at:

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
pytest
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
For any inquiries, please contact:
- Project Lead: [Your Name] ([your.email@example.com])
- Technical Lead: [Technical Lead Name] ([tech.lead@example.com]) 