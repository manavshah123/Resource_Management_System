# Resource Management Portal - Entity Relationship Diagram

## Overview
This document describes the database schema and entity relationships for the Resource Management Portal (RMP).

---

## ER Diagram (Mermaid)

```mermaid
erDiagram
    %% Core User & Employee
    USERS {
        bigint id PK
        varchar email UK
        varchar password
        varchar name
        varchar phone
        varchar avatar
        boolean enabled
        boolean account_non_locked
        varchar refresh_token
        timestamp created_at
        timestamp updated_at
    }
    
    USER_ROLES {
        bigint user_id FK
        varchar role
    }
    
    EMPLOYEES {
        bigint id PK
        varchar employee_id UK
        varchar name
        varchar email UK
        varchar phone
        varchar department
        varchar designation
        varchar location
        date join_date
        double max_fte
        varchar status
        varchar availability_status
        bigint manager_id FK
        bigint user_id FK
        varchar bio
        varchar avatar
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }

    %% Skills
    SKILLS {
        bigint id PK
        varchar name UK
        varchar description
        varchar category
        timestamp created_at
        timestamp updated_at
    }
    
    EMPLOYEE_SKILL_DETAILS {
        bigint id PK
        bigint employee_id FK
        bigint skill_id FK
        varchar level
        int years_of_experience
        boolean is_primary
        varchar notes
        timestamp created_at
        timestamp updated_at
    }

    %% Projects & Allocations
    PROJECTS {
        bigint id PK
        varchar name
        text description
        varchar client
        varchar status
        varchar priority
        date start_date
        date end_date
        int progress
        decimal budget
        decimal spent_budget
        bigint manager_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    PROJECT_REQUIRED_SKILLS {
        bigint project_id FK
        bigint skill_id FK
    }
    
    MILESTONES {
        bigint id PK
        varchar name
        text description
        bigint project_id FK
        date due_date
        date completed_date
        varchar status
        timestamp created_at
        timestamp updated_at
    }
    
    ALLOCATIONS {
        bigint id PK
        bigint employee_id FK
        bigint project_id FK
        double fte
        date start_date
        date end_date
        varchar role
        text notes
        varchar status
        boolean billable
        timestamp created_at
        timestamp updated_at
    }

    %% Training & Learning
    TRAININGS {
        bigint id PK
        varchar title
        text description
        varchar category
        varchar difficulty
        int duration_hours
        date due_date
        varchar attachment_url
        varchar video_url
        varchar external_link
        varchar status
        bigint author_id FK
        int total_modules
        timestamp created_at
        timestamp updated_at
    }
    
    TRAINING_SKILLS {
        bigint training_id FK
        bigint skill_id FK
    }
    
    TRAINING_MODULES {
        bigint id PK
        bigint training_id FK
        varchar title
        text content
        int order_index
        varchar module_type
        varchar resource_url
        int duration_minutes
        timestamp created_at
        timestamp updated_at
    }
    
    TRAINING_ASSIGNMENTS {
        bigint id PK
        bigint training_id FK
        bigint employee_id FK
        date assigned_date
        date due_date
        varchar status
        int progress_percentage
        timestamp started_at
        timestamp completed_at
        text remarks
        text employee_notes
        varchar proof_url
        bigint assigned_by FK
        boolean skill_added
        timestamp created_at
        timestamp updated_at
    }
    
    TRAINING_PROGRESS {
        bigint id PK
        bigint assignment_id FK
        bigint module_id FK
        varchar status
        timestamp started_at
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
    }
    
    CERTIFICATES {
        bigint id PK
        varchar certificate_number UK
        bigint employee_id FK
        bigint training_id FK
        bigint assignment_id FK
        date issued_date
        date expiry_date
        varchar issued_by
        varchar verification_url
        varchar status
        timestamp created_at
        timestamp updated_at
    }

    %% Quizzes
    QUIZZES {
        bigint id PK
        varchar title
        text description
        varchar difficulty
        varchar category
        int passing_score
        int duration_minutes
        int max_attempts
        boolean shuffle_questions
        boolean show_correct_answers
        varchar status
        bigint training_id FK
        bigint created_by_user_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    QUIZ_QUESTIONS {
        bigint id PK
        bigint quiz_id FK
        text question_text
        varchar question_type
        int points
        int order_index
        text explanation
        timestamp created_at
        timestamp updated_at
    }
    
    QUIZ_OPTIONS {
        bigint id PK
        bigint question_id FK
        text option_text
        boolean is_correct
        int order_index
        timestamp created_at
        timestamp updated_at
    }
    
    QUIZ_ASSIGNMENTS {
        bigint id PK
        bigint quiz_id FK
        bigint employee_id FK
        date assigned_date
        date due_date
        varchar status
        bigint assigned_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    QUIZ_ATTEMPTS {
        bigint id PK
        bigint quiz_id FK
        bigint employee_id FK
        int score
        int total_points
        double percentage
        boolean passed
        timestamp started_at
        timestamp completed_at
        int time_spent_seconds
        int attempt_number
        timestamp created_at
        timestamp updated_at
    }
    
    QUIZ_ANSWERS {
        bigint id PK
        bigint attempt_id FK
        bigint question_id FK
        bigint selected_option_id FK
        text text_answer
        boolean is_correct
        int points_earned
        timestamp created_at
        timestamp updated_at
    }

    %% Relationships
    USERS ||--o| EMPLOYEES : "has"
    USERS ||--o{ USER_ROLES : "has"
    EMPLOYEES ||--o{ EMPLOYEES : "manages"
    EMPLOYEES ||--o{ EMPLOYEE_SKILL_DETAILS : "has"
    SKILLS ||--o{ EMPLOYEE_SKILL_DETAILS : "possessed_by"
    EMPLOYEES ||--o{ ALLOCATIONS : "assigned_to"
    PROJECTS ||--o{ ALLOCATIONS : "has"
    PROJECTS ||--o{ MILESTONES : "has"
    PROJECTS ||--o{ PROJECT_REQUIRED_SKILLS : "requires"
    SKILLS ||--o{ PROJECT_REQUIRED_SKILLS : "required_by"
    EMPLOYEES }o--|| PROJECTS : "manages"
    
    TRAININGS ||--o{ TRAINING_MODULES : "contains"
    TRAININGS ||--o{ TRAINING_ASSIGNMENTS : "has"
    TRAININGS ||--o{ TRAINING_SKILLS : "teaches"
    SKILLS ||--o{ TRAINING_SKILLS : "taught_in"
    EMPLOYEES ||--o{ TRAINING_ASSIGNMENTS : "assigned"
    TRAINING_ASSIGNMENTS ||--o{ TRAINING_PROGRESS : "tracks"
    TRAINING_MODULES ||--o{ TRAINING_PROGRESS : "progressed"
    TRAINING_ASSIGNMENTS ||--o| CERTIFICATES : "earns"
    EMPLOYEES ||--o{ CERTIFICATES : "holds"
    TRAININGS ||--o{ CERTIFICATES : "certifies"
    USERS ||--o{ TRAININGS : "authors"
    USERS ||--o{ TRAINING_ASSIGNMENTS : "assigns"
    
    QUIZZES ||--o{ QUIZ_QUESTIONS : "contains"
    QUIZ_QUESTIONS ||--o{ QUIZ_OPTIONS : "has"
    TRAININGS ||--o{ QUIZZES : "has"
    USERS ||--o{ QUIZZES : "creates"
    QUIZZES ||--o{ QUIZ_ASSIGNMENTS : "has"
    EMPLOYEES ||--o{ QUIZ_ASSIGNMENTS : "assigned"
    QUIZZES ||--o{ QUIZ_ATTEMPTS : "attempted"
    EMPLOYEES ||--o{ QUIZ_ATTEMPTS : "attempts"
    QUIZ_ATTEMPTS ||--o{ QUIZ_ANSWERS : "contains"
    QUIZ_QUESTIONS ||--o{ QUIZ_ANSWERS : "answered_in"
    QUIZ_OPTIONS ||--o{ QUIZ_ANSWERS : "selected_in"
```

---

## Entity Descriptions

### Core Entities

#### Users
Authentication and authorization entity for system access.
- **Roles**: ADMIN, PM (Project Manager), HR, EMPLOYEE
- **Relationships**: One-to-One with Employee

#### Employees
Core resource entity representing team members.
- **Statuses**: ACTIVE, INACTIVE, ON_LEAVE, TERMINATED
- **Availability**: AVAILABLE, PARTIALLY_AVAILABLE, FULLY_ALLOCATED, ON_LEAVE, UNAVAILABLE
- **FTE**: Full-Time Equivalent (1.0 = 8 hours/day)
- **Self-referential**: Manager relationship

### Skills & Competencies

#### Skills
Master list of technical and soft skills.
- **Categories**: Technical, Soft Skills, Domain, etc.

#### EmployeeSkill (Junction)
Maps employees to their skills with proficiency levels.
- **Levels**: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
- Tracks years of experience and primary skill flag

### Projects & Allocations

#### Projects
Work items that require resource allocation.
- **Statuses**: NOT_STARTED, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED
- **Priority**: LOW, MEDIUM, HIGH, CRITICAL
- Tracks budget, progress, and required skills

#### Allocations
Links employees to projects with time allocation.
- **FTE-based**: Uses Full-Time Equivalent (0.5 FTE = 4 hours/day)
- **Statuses**: ACTIVE, PENDING, COMPLETED, CANCELLED
- Tracks billable/non-billable time

#### Milestones
Project deliverables and checkpoints.
- **Statuses**: NOT_STARTED, IN_PROGRESS, COMPLETED, DELAYED

### Training & Development

#### Training
Learning content and courses.
- **Categories**: TECHNICAL, SOFT_SKILL, DOMAIN, COMPLIANCE, LEADERSHIP, CERTIFICATION, ONBOARDING
- **Difficulty**: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
- Contains modules and links to skills

#### TrainingAssignment
Assigns training to employees.
- Tracks progress, due dates, and completion status
- Links to certificates upon completion

#### TrainingModule
Individual learning units within a training.
- Ordered content with different types (video, document, quiz)

#### Certificate
Proof of training completion.
- Issued upon successful training completion
- Optional expiry date

### Quizzes & Assessments

#### Quiz
Assessment linked to training or standalone.
- Configurable passing score and time limits
- Supports multiple attempts

#### QuizQuestion
Individual questions in a quiz.
- **Types**: SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, TEXT
- Ordered and weighted by points

#### QuizAttempt
Individual attempt at completing a quiz.
- Tracks score, time spent, and pass/fail status

---

## Relationship Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| User ↔ Employee | 1:1 | Each user has one employee profile |
| Employee ↔ Manager | N:1 | Employees report to a manager |
| Employee ↔ Skills | M:N | Via EmployeeSkill junction |
| Employee ↔ Projects | M:N | Via Allocations |
| Project ↔ Skills | M:N | Required skills for project |
| Project → Milestones | 1:N | Project has milestones |
| Training → Modules | 1:N | Training contains modules |
| Training ↔ Skills | M:N | Training teaches skills |
| Employee ↔ Training | M:N | Via TrainingAssignment |
| TrainingAssignment → Certificate | 1:1 | Completion earns certificate |
| Quiz → Questions | 1:N | Quiz contains questions |
| Question → Options | 1:N | Question has options |
| Employee ↔ Quiz | M:N | Via QuizAssignment/Attempt |

---

## Database Statistics

| Entity | Table Name | Primary Features |
|--------|-----------|------------------|
| User | users | Authentication, Roles |
| Employee | employees | Resources, Skills, Allocations |
| Skill | skills | Competency tracking |
| Project | projects | Work management |
| Allocation | allocations | Resource assignment |
| Training | trainings | Learning management |
| Quiz | quizzes | Assessment system |
| Certificate | certificates | Credential management |

---

## Visual ER Diagram (Text-Based)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              RESOURCE MANAGEMENT PORTAL - ER DIAGRAM                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────┐
                                    │    USERS     │
                                    │──────────────│
                                    │ id (PK)      │
                                    │ email        │
                                    │ password     │
                                    │ name         │
                                    │ roles[]      │
                                    └──────┬───────┘
                                           │ 1:1
                                           ▼
┌──────────────┐     M:N      ┌──────────────────┐     M:N      ┌──────────────┐
│    SKILLS    │◄────────────►│    EMPLOYEES     │◄────────────►│   PROJECTS   │
│──────────────│              │──────────────────│              │──────────────│
│ id (PK)      │              │ id (PK)          │              │ id (PK)      │
│ name         │              │ employee_id      │              │ name         │
│ category     │              │ name             │              │ client       │
│ description  │              │ department       │              │ status       │
└──────┬───────┘              │ manager_id (FK)──┼──────┐       │ priority     │
       │                      │ max_fte          │      │       │ budget       │
       │                      └────────┬─────────┘      │       └──────┬───────┘
       │                               │                │              │
       │         ┌─────────────────────┼────────────────┘              │
       │         │                     │                               │
       ▼         ▼                     ▼                               ▼
┌──────────────────────┐     ┌─────────────────┐              ┌──────────────┐
│  EMPLOYEE_SKILLS     │     │   ALLOCATIONS   │              │  MILESTONES  │
│──────────────────────│     │─────────────────│              │──────────────│
│ employee_id (FK)     │     │ id (PK)         │              │ id (PK)      │
│ skill_id (FK)        │     │ employee_id (FK)│              │ project_id   │
│ level                │     │ project_id (FK) │              │ name         │
│ years_experience     │     │ fte             │              │ due_date     │
└──────────────────────┘     │ start_date      │              │ status       │
                             │ end_date        │              └──────────────┘
                             │ status          │
                             └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    TRAINING & QUIZ SYSTEM                                 │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐      1:N       ┌───────────────────┐      1:N       ┌──────────────┐
│  TRAININGS   │───────────────►│ TRAINING_MODULES  │                │  EMPLOYEES   │
│──────────────│                │───────────────────│                │──────────────│
│ id (PK)      │                │ id (PK)           │                │     ...      │
│ title        │                │ training_id (FK)  │                └──────┬───────┘
│ category     │                │ title             │                       │
│ difficulty   │                │ order_index       │                       │
│ duration     │                └───────────────────┘                       │
└──────┬───────┘                                                            │
       │                                                                    │
       │ 1:N              ┌───────────────────────┐                        │
       └─────────────────►│ TRAINING_ASSIGNMENTS  │◄───────────────────────┘
                          │───────────────────────│         M:N
                          │ id (PK)               │
                          │ training_id (FK)      │
                          │ employee_id (FK)      │────────┐
                          │ status                │        │
                          │ progress_percentage   │        │ 1:1
                          └───────────────────────┘        │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │   CERTIFICATES   │
                                                  │──────────────────│
                                                  │ id (PK)          │
                                                  │ certificate_num  │
                                                  │ issued_date      │
                                                  │ expiry_date      │
                                                  └──────────────────┘

┌──────────────┐      1:N       ┌─────────────────┐      1:N       ┌──────────────┐
│   QUIZZES    │───────────────►│ QUIZ_QUESTIONS  │───────────────►│ QUIZ_OPTIONS │
│──────────────│                │─────────────────│                │──────────────│
│ id (PK)      │                │ id (PK)         │                │ id (PK)      │
│ title        │                │ quiz_id (FK)    │                │ question_id  │
│ passing_score│                │ question_text   │                │ option_text  │
│ duration_min │                │ question_type   │                │ is_correct   │
│ training_id  │                │ points          │                └──────────────┘
└──────┬───────┘                └─────────────────┘
       │
       │ 1:N
       ▼
┌─────────────────┐      1:N       ┌──────────────────┐
│  QUIZ_ATTEMPTS  │───────────────►│   QUIZ_ANSWERS   │
│─────────────────│                │──────────────────│
│ id (PK)         │                │ id (PK)          │
│ quiz_id (FK)    │                │ attempt_id (FK)  │
│ employee_id(FK) │                │ question_id (FK) │
│ score           │                │ selected_option  │
│ passed          │                │ is_correct       │
└─────────────────┘                └──────────────────┘
```

---

## Key Design Decisions

1. **FTE-based Allocation**: Uses Full-Time Equivalent instead of percentage for more accurate time tracking
2. **Soft Delete**: Employees use soft delete (deleted_at) to preserve historical data
3. **Audit Trail**: All entities extend BaseEntity with created_at, updated_at, created_by, updated_by
4. **Self-referential Manager**: Employee hierarchy through manager_id self-reference
5. **Junction Tables**: Many-to-many relationships use explicit junction tables for additional attributes
6. **Modular Training**: Training broken into modules for granular progress tracking
7. **Quiz Flexibility**: Quizzes can be standalone or linked to training

---

*Generated for RMP v1.0.0*


