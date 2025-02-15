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

### Migration Strategy
1. **Data Transformation**:
   - Convert string dates to Date objects
   - Split experience years into startDate and endDate
   - Add timestamps for tracking

2. **Indexing**:
   - Create indexes on frequently searched fields:
     ```javascript
     db.resumes.createIndex({ 'personalInfo.email': 1 })
     db.resumes.createIndex({ skills: 1 })
     db.resumes.createIndex({ 'experience.position': 1 })
     ```

3. **Data Validation**:
   - Implement schema validation in MongoDB:
     ```javascript
     db.createCollection("resumes", {
       validator: {
         $jsonSchema: {
           bsonType: "object",
           required: ["personalInfo", "skills"],
           properties: {
             personalInfo: {
               bsonType: "object",
               required: ["name", "email"],
               properties: {
                 name: { bsonType: "string" },
                 email: { bsonType: "string" }
               }
             },
             skills: {
               bsonType: "array",
               minItems: 1,
               items: { bsonType: "string" }
             }
           }
         }
       }
     })
     ```

### Authentication Database
We recommend using MongoDB for authentication to maintain consistency. Here's the schema:

```javascript
{
  _id: ObjectId,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['candidate', 'recruiter'] },
  profile: {
    firstName: String,
    lastName: String,
    contactInfo: {
      phone: String,
      address: String
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Integration Strategy
1. **Data Relationships**:
   - Link resumes to users via email address
   - Add reference to user in resume documents:
     ```javascript
     {
       _id: ObjectId,
       userId: ObjectId, // Reference to user document
       ... // rest of resume fields
     }
     ```

2. **Search Optimization**:
   - Implement text indexes for full-text search:
     ```javascript
     db.resumes.createIndex({
       'personalInfo.name': 'text',
       skills: 'text',
       'experience.position': 'text'
     })
     ```

3. **Data Security**:
   - Implement field-level encryption for sensitive data
   - Use MongoDB's built-in access control
   - Enable auditing for data access tracking

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

## Environment Variables
Create a `.env` file in the backend directory with the following variables:
```
DATABASE_URL=postgresql://user:password@localhost:5432/resumerec
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
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