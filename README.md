# Resource Management Portal (RMP)

A full-stack Resource Management Portal for managing employees, projects, skills, and resource allocations with AI-powered skill matching.

## 🚀 Features

### Core Features
- **Employee Management**: CRUD operations, skill tracking, department organization
- **Project Management**: Project lifecycle, team composition, milestones
- **Skill Management**: Skill categories, proficiency levels, skill gap analysis
- **Resource Allocation**: Employee-project mapping, availability tracking, over-allocation alerts
- **Dashboard**: Real-time analytics, utilization charts, activity feeds

### Advanced Features
- **AI Skill Matching**: Intelligent matching of employees to projects based on skills
- **JWT Authentication**: Secure authentication with access/refresh tokens
- **Role-Based Access Control (RBAC)**: Admin, PM, HR, Employee roles
- **PDF/Excel Export**: Generate reports in multiple formats
- **Scheduled Jobs**: Automated alerts and report generation
- **RESTful API**: OpenAPI 3.0 documentation with Swagger UI

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite
- **Material-UI (MUI)** for components
- **Zustand** for state management
- **React Router v6** for routing
- **Axios** with JWT interceptor
- **Recharts** for data visualization

### Backend
- **Spring Boot 3.2** (Java 17)
- **Spring Security** with JWT
- **Spring Data JPA** with PostgreSQL
- **Quartz Scheduler** for jobs
- **iText & Apache POI** for exports
- **MapStruct** for DTO mapping
- **OpenAPI 3 / Swagger UI**

## 📁 Project Structure

```
RMP/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/             # API layer with Axios
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Page layouts
│   │   ├── modules/         # Feature-specific components
│   │   ├── pages/           # Route pages
│   │   ├── store/           # Zustand stores
│   │   ├── styles/          # Global styles & theme
│   │   └── utils/           # Helper functions
│   └── package.json
│
├── backend/                  # Spring Boot backend
│   ├── src/main/java/com/wishtree/rmp/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data transfer objects
│   │   ├── entity/          # JPA entities
│   │   ├── exceptions/      # Custom exceptions
│   │   ├── repository/      # JPA repositories
│   │   ├── scheduler/       # Quartz jobs
│   │   ├── security/        # JWT & security
│   │   ├── service/         # Business logic
│   │   └── util/            # Utilities
│   └── pom.xml
│
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Java 17+
- PostgreSQL 14+ (or use H2 for dev)
- Maven 3.8+

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Configure database in `application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/rmp_db
       username: postgres
       password: postgres
   ```

3. Run the application:
   ```bash
   # Development mode (with H2 database)
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   
   # Production mode
   mvn spring-boot:run
   ```

4. Access Swagger UI: http://localhost:8080/api/swagger-ui.html

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Access the app: http://localhost:3000

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rmp.com | admin123 |
| Project Manager | pm@rmp.com | pm123 |
| HR | hr@rmp.com | hr123 |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Employees
- `GET /api/employees` - List employees (paginated)
- `GET /api/employees/{id}` - Get employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee
- `GET /api/employees/available` - Get available employees
- `GET /api/employees/bench` - Get bench employees

### Projects
- `GET /api/projects` - List projects
- `GET /api/projects/{id}` - Get project
- `POST /api/projects` - Create project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `PATCH /api/projects/{id}/status` - Update status

### Skills
- `GET /api/skills` - List skills
- `GET /api/skills/{id}` - Get skill
- `POST /api/skills` - Create skill
- `PUT /api/skills/{id}` - Update skill
- `DELETE /api/skills/{id}` - Delete skill
- `GET /api/skills/categories` - Get categories

### Allocations
- `GET /api/allocations` - List allocations
- `GET /api/allocations/{id}` - Get allocation
- `POST /api/allocations` - Create allocation
- `PUT /api/allocations/{id}` - Update allocation
- `DELETE /api/allocations/{id}` - Delete allocation
- `GET /api/allocations/check-availability` - Check availability

### Dashboard
- `GET /api/dashboard/summary` - Dashboard summary

## 🎨 UI Features

- **Dark Sidebar** with collapsible navigation
- **Responsive Design** for mobile and desktop
- **Data Tables** with sorting, filtering, pagination
- **Charts** for analytics visualization
- **Form Validation** with error messages
- **Toast Notifications** for user feedback
- **Loading States** and empty states

## 🔒 Security

- JWT-based authentication
- Token refresh mechanism
- Role-based access control
- Password encryption with BCrypt
- CORS configuration

## 📊 Reports

- Utilization Report (PDF/Excel)
- Project Report
- Employee Report
- Skills Gap Analysis
- Bench Report

## 🗓 Scheduled Jobs

- **Daily 9 AM**: Check upcoming deallocations (7 days)
- **Daily 10 AM**: Check overallocated employees
- **Weekly Monday 8 AM**: Generate utilization report

## 📝 License

MIT License

## 👥 Contributors

Built with ❤️ by Wishtree Technologies

