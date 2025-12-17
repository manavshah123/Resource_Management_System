# Resource Management Portal (RMP)

<div align="center">

![RMP Logo](https://img.shields.io/badge/RMP-Resource%20Management%20Portal-blue?style=for-the-badge)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-brightgreen?style=flat-square&logo=spring)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**A comprehensive full-stack Resource Management Portal for managing employees, projects, skills, training, and resource allocations with AI-powered skill matching and Zoho Projects integration.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Docs](#-api-documentation) • [Screenshots](#-screenshots)

</div>

---

## 🌟 Features

### 👥 Employee Management
- Complete CRUD operations with profile management
- Skill tracking with proficiency levels (1-5)
- Department and designation organization
- **FTE (Full-Time Equivalent) allocation** tracking
- Available vs allocated capacity visualization
- Bench employee identification

### 📊 Project Management
- Full project lifecycle management (Pipeline → Active → Completed)
- **Tech Stack / Required Skills** assignment per project
- Team composition with role-based allocation
- Milestones and timeline tracking
- Budget and billing status management
- Client information management

### 🎯 Skill & Gap Analysis
- **Hierarchical skill categories** (Frontend, Backend, Cloud, etc.)
- **Skill Gap Analysis** comparing project requirements vs team skills
- Gap severity scoring and heatmaps
- AI-powered training recommendations
- Team skill matrix visualization

### 📈 Resource Allocation
- **FTE-based allocation** (0.25, 0.50, 0.75, 1.0 FTE)
- Employee-project mapping with date ranges
- **Tech stack assignment** per allocation
- Real-time availability checking
- Over-allocation alerts and warnings
- Billable vs non-billable tracking

### 📉 Forecasting & Capacity Planning
- Resource demand vs supply forecasting
- Utilization trend analysis
- Upcoming project releases
- Bench resource predictions
- Department-wise utilization charts
- Revenue forecasting based on allocations

### 🎓 Training & Certification
- Training program management
- Module-based learning paths
- Assignment and progress tracking
- Quiz assessments with scoring
- Certificate generation (PDF)
- Training recommendations based on skill gaps

### 🔗 Zoho Projects Integration
- **OAuth 2.0 authentication** with Zoho
- Import projects directly from Zoho
- Sync users from Zoho portal
- Timesheet data fetching (requires Zoho People)
- Automatic project mapping

### 📋 Reports & Exports
- **PDF & Excel export** for all reports
- Utilization reports (daily, weekly, monthly)
- Project status reports
- Employee allocation reports
- Skill distribution analysis
- Scheduled report generation (Quartz)

### 🔐 Security & Access Control
- **JWT-based authentication** with refresh tokens
- **Role-Based Access Control (RBAC)**
  - `ADMIN` - Full system access
  - `PM` - Project management
  - `HR` - Employee management
  - `EMPLOYEE` - Self-service access
- Permission-based feature access
- Password encryption with BCrypt

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI Framework |
| Vite | 5.x | Build Tool |
| Material-UI (MUI) | 5.x | Component Library |
| Zustand | 4.x | State Management |
| React Router | 6.x | Client-side Routing |
| Axios | 1.x | HTTP Client |
| Recharts | 2.x | Data Visualization |
| Day.js | 1.x | Date Handling |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Spring Boot | 3.2.2 | Application Framework |
| Spring Security | 6.x | Authentication & Authorization |
| Spring Data JPA | 3.x | Data Access |
| PostgreSQL | 14+ | Primary Database |
| Quartz Scheduler | 2.3 | Job Scheduling |
| iText | 7.x | PDF Generation |
| Apache POI | 5.x | Excel Export |
| Lombok | 1.18 | Code Generation |
| MapStruct | 1.5 | DTO Mapping |
| OpenAPI/Swagger | 3.0 | API Documentation |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container Setup |
| PostgreSQL | Production Database |
| H2 | Development Database |

---

## 📁 Project Structure

```
RMP/
├── 📂 backend/                      # Spring Boot Application
│   ├── 📂 src/main/java/com/rmp/
│   │   ├── 📂 config/              # Configuration (CORS, Security, Quartz, Zoho)
│   │   ├── 📂 controller/          # REST API Controllers
│   │   ├── 📂 dto/                 # Data Transfer Objects
│   │   │   ├── 📂 auth/            # Authentication DTOs
│   │   │   ├── 📂 report/          # Report DTOs
│   │   │   └── 📂 zoho/            # Zoho Integration DTOs
│   │   ├── 📂 entity/              # JPA Entities
│   │   ├── 📂 exceptions/          # Custom Exceptions & Handlers
│   │   ├── 📂 repository/          # Spring Data Repositories
│   │   ├── 📂 scheduler/           # Quartz Scheduled Jobs
│   │   ├── 📂 security/            # JWT & Security Configuration
│   │   ├── 📂 service/             # Business Logic Services
│   │   │   └── 📂 report/          # Report Generation Services
│   │   └── 📂 util/                # Utility Classes & Data Initializer
│   ├── 📂 src/main/resources/
│   │   └── application.yml         # Application Configuration
│   └── pom.xml                     # Maven Dependencies
│
├── 📂 frontend/                     # React + Vite Application
│   ├── 📂 src/
│   │   ├── 📂 api/                 # API Client & Service Modules
│   │   ├── 📂 components/          # Reusable UI Components
│   │   │   ├── 📂 auth/            # Authentication Components
│   │   │   ├── 📂 common/          # Shared Components
│   │   │   └── 📂 navigation/      # Sidebar & Topbar
│   │   ├── 📂 hooks/               # Custom React Hooks
│   │   ├── 📂 layouts/             # Page Layouts
│   │   ├── 📂 modules/             # Feature-specific Modules
│   │   ├── 📂 pages/               # Route Pages
│   │   │   ├── 📂 allocations/
│   │   │   ├── 📂 auth/
│   │   │   ├── 📂 dashboard/
│   │   │   ├── 📂 employees/
│   │   │   ├── 📂 forecasting/
│   │   │   ├── 📂 integrations/    # Zoho Integration UI
│   │   │   ├── 📂 projects/
│   │   │   ├── 📂 quiz/
│   │   │   ├── 📂 reports/
│   │   │   ├── 📂 settings/
│   │   │   ├── 📂 skill-gap/
│   │   │   ├── 📂 skills/
│   │   │   ├── 📂 training/
│   │   │   └── 📂 users/
│   │   ├── 📂 store/               # Zustand State Management
│   │   ├── 📂 styles/              # Global Styles & Theme
│   │   └── 📂 utils/               # Helper Functions
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── 📂 docker/                       # Docker Configuration
│   └── init-db.sql                 # Database Initialization
├── 📂 docs/                         # Documentation
│   ├── ER_DIAGRAM.md
│   └── er-diagram.html
├── docker-compose.yml              # Docker Compose Setup
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Java** 21+ ([Download](https://adoptium.net/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Maven** 3.8+ ([Download](https://maven.apache.org/download.cgi))

### Option 1: Docker (Recommended)

   ```bash
# Clone the repository
git clone https://github.com/manavshah123/Resource_Management_System.git
cd rmp

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api
# Swagger UI: http://localhost:8080/api/swagger-ui.html
```

### Option 2: Manual Setup

#### 1. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE rmp_db;
\q
```

#### 2. Backend Setup

   ```bash
cd backend

# Configure database in src/main/resources/application.yml
# Update the following properties:
#   spring.datasource.url: jdbc:postgresql://localhost:5432/rmp_db
#   spring.datasource.username: postgres
#   spring.datasource.password: your_password

# Run the application
mvn spring-boot:run -DskipTests

# The backend will start on http://localhost:8080/api
```

#### 3. Frontend Setup

   ```bash
   cd frontend

# Install dependencies
   npm install

# Start development server
   npm run dev

# The frontend will start on http://localhost:3000
   ```

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@rmp.com | admin123 |
| **Project Manager** | pm@rmp.com | pm123 |
| **HR** | hr@rmp.com | hr123 |
| **Employee** | john.doe@company.com | password123 |

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

### Employee Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List employees (paginated) |
| GET | `/api/employees/{id}` | Get employee details |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/{id}` | Update employee |
| DELETE | `/api/employees/{id}` | Delete employee |
| GET | `/api/employees/available` | Get available employees |
| GET | `/api/employees/bench` | Get bench employees |
| GET | `/api/employees/{id}/profile` | Get employee profile |

### Project Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| GET | `/api/projects/{id}` | Get project details |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project |
| PATCH | `/api/projects/{id}/status` | Update project status |

### Allocation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/allocations` | List allocations |
| POST | `/api/allocations` | Create allocation |
| PUT | `/api/allocations/{id}` | Update allocation |
| DELETE | `/api/allocations/{id}` | Delete allocation |
| GET | `/api/allocations/check-availability` | Check employee availability |

### Skill Gap Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/skill-gap/project/{id}` | Analyze project skill gaps |
| GET | `/api/skill-gap/employee/{id}` | Analyze employee skill gaps |
| GET | `/api/skill-gap/team-matrix/{projectId}` | Get team skill matrix |
| GET | `/api/skill-gap/recommendations/{employeeId}` | Get training recommendations |

### Zoho Integration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/integrations/zoho/status` | Get integration status |
| GET | `/api/integrations/zoho/auth-url` | Get OAuth authorization URL |
| POST | `/api/integrations/zoho/callback` | OAuth callback handler |
| GET | `/api/integrations/zoho/projects` | Fetch Zoho projects |
| POST | `/api/integrations/zoho/projects/import` | Import Zoho projects |
| GET | `/api/integrations/zoho/users` | Fetch Zoho users |
| POST | `/api/integrations/zoho/disconnect` | Disconnect integration |

### Report Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/utilization` | Get utilization report |
| GET | `/api/reports/projects` | Get project report |
| GET | `/api/reports/employees` | Get employee report |
| GET | `/api/reports/download/{type}/{format}` | Download report (PDF/Excel) |

> 📖 **Full API Documentation**: Access Swagger UI at `http://localhost:8080/api/swagger-ui.html`

---

## 🔗 Zoho Projects Integration

### Setup Instructions

1. **Create Zoho API Client**
   - Go to [Zoho API Console](https://api-console.zoho.com/)
   - Click "ADD CLIENT" → "Server-based Applications"
   - Fill in:
     - Client Name: `RMP Integration`
     - Homepage URL: `http://localhost:3000`
     - Authorized Redirect URI: `http://localhost:3000/integrations/zoho/callback`

2. **Configure in `application.yml`**
   ```yaml
   zoho:
     enabled: true
     client-id: YOUR_CLIENT_ID
     client-secret: YOUR_CLIENT_SECRET
     redirect-uri: http://localhost:3000/integrations/zoho/callback
   ```

3. **Required Scopes**
   - `ZohoProjects.portals.READ`
   - `ZohoProjects.projects.READ`
   - `ZohoProjects.tasks.READ`
   - `ZohoProjects.users.READ`
   - `ZOHOPEOPLE.timetracker.READ` (for timesheets - requires Zoho People)

4. **Connect from UI**
   - Navigate to "Zoho Sync" in the sidebar
   - Click "Connect to Zoho"
   - Authorize the application
   - Start importing projects!

---

## 🗓 Scheduled Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Deallocation Alert | Daily 9:00 AM | Notify about allocations ending in 7 days |
| Over-allocation Check | Daily 10:00 AM | Alert for over-allocated employees |
| Weekly Utilization Report | Monday 8:00 AM | Generate and email utilization report |

---

## 🎨 UI Features

- **Modern Dark Sidebar** with collapsible navigation
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Data Tables** with sorting, filtering, and pagination
- **Interactive Charts** using Recharts
- **Form Validation** with real-time error feedback
- **Toast Notifications** for success/error messages
- **Loading Skeletons** for better UX
- **Empty States** with helpful guidance
- **FTE Selector** for allocation management

---

## 📊 Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │────▶│   Employee   │────▶│  Allocation  │
└──────────────┘     └──────────────┘     └──────────────┘
                            │                    │
                            ▼                    ▼
                     ┌──────────────┐     ┌──────────────┐
                     │ EmployeeSkill│     │   Project    │
                     └──────────────┘     └──────────────┘
                            │                    │
                            ▼                    ▼
                     ┌──────────────┐     ┌──────────────┐
                     │    Skill     │     │  Milestone   │
                     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │SkillCategory │
                     └──────────────┘
```

> 📖 **Full ER Diagram**: See `docs/ER_DIAGRAM.md` or open `docs/er-diagram.html`

---

## 🧪 Testing

```bash
# Backend tests
cd backend
mvn test

# Frontend tests (if configured)
cd frontend
npm test
```

---

## 🚢 Deployment

### Production Build

```bash
# Backend
cd backend
mvn clean package -DskipTests
java -jar target/rmp-1.0.0.jar

# Frontend
cd frontend
npm run build
# Serve the dist/ folder with Nginx or any static server
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/rmp_db` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `postgres` |
| `JWT_SECRET` | JWT signing secret | (auto-generated) |
| `ZOHO_CLIENT_ID` | Zoho API Client ID | - |
| `ZOHO_CLIENT_SECRET` | Zoho API Client Secret | - |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built with ❤️ by **Manav Shah**

---

<div align="center">

**[⬆ Back to Top](#resource-management-portal-rmp)**

</div>
