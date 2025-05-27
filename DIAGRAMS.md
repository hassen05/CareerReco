# CareerReco System Diagrams

## 1. Use Case Diagram

```mermaid
graph TD
    %% Actors
    Recruiter[Recruiter]
    JobSeeker[Job Seeker]
    Admin[Admin]
    
    %% Use Cases
    subgraph " "
        direction TB
        UC1[Upload Resume]
        UC2[Search Jobs]
        UC3[View Matches]
        UC4[Manage Job Posts]
        UC5[View Analytics]
        UC6[System Configuration]
    end
    
    %% Relationships
    JobSeeker --> UC1
    JobSeeker --> UC2
    Recruiter --> UC3
    Recruiter --> UC4
    Recruiter --> UC5
    Admin --> UC6
    
    %% Extensions
    UC2 -.->|Advanced Filters| UC2
    UC3 -.->|Export Results| UC3
```

## 2. Class Diagram

```mermaid
classDiagram
    class User {
        +String id
        +String email
        +String role
        +authenticate()
        +updateProfile()
    }
    
    class Resume {
        +String id
        +String userId
        +List~Experience~ experiences
        +List~String~ skills
        +generateEmbedding()
    }
    
    class JobPosting {
        +String id
        +String title
        +String description
        +List~String~ requiredSkills
        +List~String~ preferredSkills
    }
    
    class MatchingEngine {
        +findMatches(job, candidates)
        +calculateScore(resume, job)
        +generateReport()
    }
    
    User <|-- Recruiter
    User <|-- JobSeeker
    User <|-- Admin
    
    User "1" -- "0..*" Resume : uploads
    JobSeeker "1" -- "0..*" Resume : has
    MatchingEngine "1" -- "1..*" Resume : processes
    MatchingEngine "1" -- "1" JobPosting : analyzes
```

## 3. Sequence Diagram: Resume Matching Process

```mermaid
sequenceDiagram
    participant R as Recruiter
    participant FE as Frontend
    participant BE as Backend
    participant DB as Database
    participant ME as Matching Engine
    
    R->>FE: Submit Job Description
    FE->>BE: POST /api/jobs
    BE->>DB: Save Job Posting
    DB-->>BE: Confirmation
    BE->>ME: Trigger Matching
    
    ME->>DB: Fetch Active Resumes
    DB-->>ME: Return Resumes
    
    loop For Each Resume
        ME->>ME: Calculate Match Score
        ME->>ME: Generate Match Reasons
    end
    
    ME->>DB: Save Results
    BE-->>FE: Return Match Summary
    FE-->>R: Display Matches
    
    R->>FE: Request Detailed View
    FE->>BE: GET /api/matches/{id}
    BE->>DB: Fetch Match Details
    DB-->>BE: Return Details
    BE-->>FE: Return Detailed View
    FE-->>R: Show Candidate Details
```

## 4. Component Diagram

```mermaid
graph TD
    subgraph "Frontend"
        A[Web App]
        B[Admin Dashboard]
        C[Authentication]
    end
    
    subgraph "Backend"
        D[API Gateway]
        E[User Service]
        F[Resume Service]
        G[Matching Service]
        H[LLM Service]
    end
    
    subgraph "Data Storage"
        I[(PostgreSQL)]
        J[(Vector DB)]
        K[(Object Storage)]
    end
    
    A --> D
    B --> D
    C --> D
    
    D --> E
    D --> F
    D --> G
    G --> H
    
    E --> I
    F --> I
    F --> J
    F --> K
    G --> I
    G --> J
```

## 5. State Diagram: Application State

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> Authenticated: Login Success
    
    state Authenticated {
        [*] --> Dashboard
        Dashboard --> ResumeManagement: Manage Resumes
        Dashboard --> JobSearch: Find Jobs
        Dashboard --> Analytics: View Reports
        
        state if_admin <<choice>>
        Analytics --> if_admin
        if_admin --> AdminDashboard: isAdmin
        if_admin --> AccessDenied: !isAdmin
    }
    
    state ResumeManagement {
        [*] --> ListView
        ListView --> DetailView: Select Resume
        DetailView --> EditView: Edit
        DetailView --> ListView: Back
        EditView --> DetailView: Save
    }
    
    Authenticated --> [*]: Logout
```

## Usage Notes

These diagrams use Mermaid.js syntax and can be rendered in:
- GitHub Markdown files
- VS Code with Mermaid extension
- Mermaid Live Editor (https://mermaid.live/)
- Any markdown viewer with Mermaid support

To update any diagram, simply modify the Mermaid code blocks above.
