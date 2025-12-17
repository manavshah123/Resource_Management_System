package com.wishtree.rmp.util;

import com.wishtree.rmp.entity.*;
import com.wishtree.rmp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

/**
 * Initializes sample data for development/demo purposes.
 * Runs on startup if no users exist in the database.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final SkillCategoryRepository skillCategoryRepository;
    private final ProjectRepository projectRepository;
    private final AllocationRepository allocationRepository;
    private final TrainingRepository trainingRepository;
    private final TrainingAssignmentRepository trainingAssignmentRepository;
    private final TrainingModuleRepository trainingModuleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Data already initialized, skipping...");
            return;
        }

        log.info("Initializing sample data...");

        // Create permissions first
        createPermissions();

        // Create users (admin, pm, hr) - returns their employee profiles
        List<Employee> userEmployees = createUsers();

        // Create Skill Categories
        createSkillCategories();

        // Create Skills
        Map<String, Skill> skillsMap = createSkills();

        // Create additional Employees with skills
        List<Employee> employees = createEmployees(skillsMap);
        
        // Combine all employees (user employees + regular employees)
        List<Employee> allEmployees = new ArrayList<>();
        allEmployees.addAll(userEmployees);
        allEmployees.addAll(employees);

        // Create Projects
        List<Project> projects = createProjects();

        // Create Allocations
        createAllocations(employees, projects);

        // Create Trainings and assign to all employees including admin/pm/hr
        createTrainings(skillsMap, allEmployees);

        log.info("Sample data initialized successfully!");
        log.info("Login credentials:");
        log.info("  Admin: admin@rmp.com / admin123");
        log.info("  PM: pm@rmp.com / pm123");
        log.info("  HR: hr@rmp.com / hr123");
    }

    private void createTrainings(Map<String, Skill> skillsMap, List<Employee> employees) {
        List<Training> trainings = Arrays.asList(
                createTraining("React Fundamentals", "Learn React basics including components, hooks, and state management. This comprehensive course covers everything from JSX to advanced patterns.", 
                        Training.Category.TECHNICAL, Training.Difficulty.BEGINNER, 8),
                createTraining("Spring Boot Advanced", "Deep dive into Spring Boot microservices architecture. Build scalable, production-ready applications.", 
                        Training.Category.TECHNICAL, Training.Difficulty.ADVANCED, 16),
                createTraining("AWS Cloud Practitioner", "AWS fundamentals and cloud computing concepts. Prepare for the AWS Cloud Practitioner certification.", 
                        Training.Category.CERTIFICATION, Training.Difficulty.INTERMEDIATE, 20),
                createTraining("Effective Communication", "Improve workplace communication and presentation skills for better team collaboration.", 
                        Training.Category.SOFT_SKILL, Training.Difficulty.BEGINNER, 4),
                createTraining("Agile & Scrum", "Learn agile methodology and scrum practices. Become a certified Scrum practitioner.", 
                        Training.Category.DOMAIN, Training.Difficulty.INTERMEDIATE, 8),
                createTraining("Leadership Essentials", "Develop leadership skills for team management and career growth.", 
                        Training.Category.LEADERSHIP, Training.Difficulty.ADVANCED, 12),
                createTraining("Docker & Kubernetes", "Container orchestration and deployment. Master containerization for modern applications.", 
                        Training.Category.TECHNICAL, Training.Difficulty.ADVANCED, 16),
                createTraining("Company Onboarding", "Introduction to company policies, culture, and workflows.", 
                        Training.Category.ONBOARDING, Training.Difficulty.BEGINNER, 4)
        );
        trainingRepository.saveAll(trainings);

        // Add modules to React Fundamentals (with YouTube videos)
        addModulesToTraining(trainings.get(0), Arrays.asList(
                createModule("Introduction to React", "Understanding what React is and why it's popular", "https://www.youtube.com/watch?v=SqcY0GlETPk", TrainingModule.MaterialType.VIDEO, 30, 0),
                createModule("JSX Fundamentals", "Learn JSX syntax and how it compiles to JavaScript", "https://www.youtube.com/watch?v=9GtB5G2xGTY", TrainingModule.MaterialType.VIDEO, 45, 1),
                createModule("Components & Props", "Creating reusable components and passing data with props", "https://www.youtube.com/watch?v=Y2hgEGPzTZY", TrainingModule.MaterialType.VIDEO, 60, 2),
                createModule("State Management", "Managing state with useState hook", "https://www.youtube.com/watch?v=O6P86uwfdR0", TrainingModule.MaterialType.VIDEO, 60, 3),
                createModule("useEffect Hook", "Side effects and lifecycle management", "https://www.youtube.com/watch?v=0ZJgIjIuY7U", TrainingModule.MaterialType.VIDEO, 45, 4),
                createModule("Practice Project", "Build a Todo application", "https://github.com/react-examples/todo-app", TrainingModule.MaterialType.ASSIGNMENT, 120, 5)
        ));

        // Add modules to Spring Boot Advanced (with YouTube videos)
        addModulesToTraining(trainings.get(1), Arrays.asList(
                createModule("Microservices Architecture", "Understanding microservices patterns and best practices", "https://www.youtube.com/watch?v=rv4LlmLmVWk", TrainingModule.MaterialType.VIDEO, 60, 0),
                createModule("Spring Cloud Config", "Centralized configuration management", "https://www.youtube.com/watch?v=gb1i4WyWNK4", TrainingModule.MaterialType.VIDEO, 45, 1),
                createModule("Service Discovery", "Implementing Eureka for service discovery", "https://www.youtube.com/watch?v=e09P-CkCvvs", TrainingModule.MaterialType.VIDEO, 60, 2),
                createModule("API Gateway", "Implementing Spring Cloud Gateway", "https://www.youtube.com/watch?v=BnknNTN8icw", TrainingModule.MaterialType.VIDEO, 60, 3),
                createModule("Circuit Breaker Pattern", "Implementing resilience with Resilience4j", "https://www.youtube.com/watch?v=9AXANwwIy5s", TrainingModule.MaterialType.VIDEO, 45, 4),
                createModule("Distributed Tracing", "Implementing Zipkin for distributed tracing", "https://www.youtube.com/watch?v=dLBQ82W3OBw", TrainingModule.MaterialType.VIDEO, 45, 5),
                createModule("Final Project", "Build a complete microservices application", null, TrainingModule.MaterialType.ASSIGNMENT, 180, 6)
        ));

        // Add modules to AWS Cloud Practitioner (with YouTube videos)
        addModulesToTraining(trainings.get(2), Arrays.asList(
                createModule("Cloud Concepts", "Introduction to cloud computing and AWS", "https://www.youtube.com/watch?v=ulprqHHWlng", TrainingModule.MaterialType.VIDEO, 45, 0),
                createModule("AWS Global Infrastructure", "Regions, AZs, and Edge Locations", "https://www.youtube.com/watch?v=Z3SYDTMP3ME", TrainingModule.MaterialType.VIDEO, 30, 1),
                createModule("Core AWS Services", "EC2, S3, RDS, and VPC basics", "https://www.youtube.com/watch?v=JIbIYCM48to", TrainingModule.MaterialType.VIDEO, 90, 2),
                createModule("Security & Compliance", "IAM, security groups, and compliance", "https://www.youtube.com/watch?v=Ul6FW4UANGc", TrainingModule.MaterialType.VIDEO, 60, 3),
                createModule("Pricing & Billing", "AWS pricing models and cost management", "https://aws.amazon.com/pricing/", TrainingModule.MaterialType.LINK, 45, 4),
                createModule("Practice Exam", "Take a practice certification exam", "https://aws.amazon.com/certification/", TrainingModule.MaterialType.QUIZ, 60, 5)
        ));

        // Add modules to Effective Communication
        addModulesToTraining(trainings.get(3), Arrays.asList(
                createModule("Active Listening", "Techniques for better listening", null, TrainingModule.MaterialType.VIDEO, 30, 0),
                createModule("Written Communication", "Email etiquette and documentation", null, TrainingModule.MaterialType.DOCUMENT, 45, 1),
                createModule("Presentation Skills", "Creating and delivering effective presentations", null, TrainingModule.MaterialType.VIDEO, 60, 2),
                createModule("Feedback Techniques", "Giving and receiving constructive feedback", null, TrainingModule.MaterialType.LINK, 30, 3)
        ));

        // Add modules to Agile & Scrum
        addModulesToTraining(trainings.get(4), Arrays.asList(
                createModule("Agile Principles", "Understanding the Agile Manifesto", "https://agilemanifesto.org/", TrainingModule.MaterialType.LINK, 30, 0),
                createModule("Scrum Framework", "Roles, events, and artifacts", "https://scrum.org/resources/what-is-scrum", TrainingModule.MaterialType.VIDEO, 60, 1),
                createModule("Sprint Planning", "How to plan and execute sprints", null, TrainingModule.MaterialType.VIDEO, 45, 2),
                createModule("Daily Standups", "Running effective daily meetings", null, TrainingModule.MaterialType.LINK, 20, 3),
                createModule("Retrospectives", "Continuous improvement techniques", null, TrainingModule.MaterialType.VIDEO, 45, 4),
                createModule("Scrum Certification Quiz", "Test your Scrum knowledge", null, TrainingModule.MaterialType.QUIZ, 30, 5)
        ));

        // Add modules to Leadership Essentials
        addModulesToTraining(trainings.get(5), Arrays.asList(
                createModule("Leadership Styles", "Understanding different leadership approaches", null, TrainingModule.MaterialType.VIDEO, 45, 0),
                createModule("Team Building", "Creating high-performing teams", null, TrainingModule.MaterialType.VIDEO, 60, 1),
                createModule("Conflict Resolution", "Managing and resolving team conflicts", null, TrainingModule.MaterialType.LINK, 45, 2),
                createModule("Delegation", "Effective task delegation strategies", null, TrainingModule.MaterialType.VIDEO, 30, 3),
                createModule("Performance Management", "Setting goals and providing feedback", null, TrainingModule.MaterialType.DOCUMENT, 60, 4),
                createModule("Case Study Analysis", "Analyze real-world leadership scenarios", null, TrainingModule.MaterialType.ASSIGNMENT, 90, 5)
        ));

        // Add modules to Docker & Kubernetes (with YouTube videos)
        addModulesToTraining(trainings.get(6), Arrays.asList(
                createModule("Docker Basics", "Understanding containers and images", "https://www.youtube.com/watch?v=fqMOX6JJhGo", TrainingModule.MaterialType.VIDEO, 45, 0),
                createModule("Dockerfile Best Practices", "Writing efficient Dockerfiles", "https://www.youtube.com/watch?v=WmcdMiyqfZs", TrainingModule.MaterialType.VIDEO, 60, 1),
                createModule("Docker Compose", "Multi-container applications", "https://www.youtube.com/watch?v=DM65_JyGxCo", TrainingModule.MaterialType.VIDEO, 45, 2),
                createModule("Kubernetes Architecture", "Understanding K8s components", "https://www.youtube.com/watch?v=X48VuDVv0do", TrainingModule.MaterialType.VIDEO, 60, 3),
                createModule("Deployments & Services", "Deploying applications to Kubernetes", "https://www.youtube.com/watch?v=s_o8dwzRlu4", TrainingModule.MaterialType.VIDEO, 60, 4),
                createModule("Helm Charts", "Package management for Kubernetes", "https://www.youtube.com/watch?v=-ykwb1d0DXU", TrainingModule.MaterialType.VIDEO, 45, 5),
                createModule("Hands-on Lab", "Deploy a microservices app to K8s", null, TrainingModule.MaterialType.ASSIGNMENT, 120, 6)
        ));

        // Add modules to Company Onboarding
        addModulesToTraining(trainings.get(7), Arrays.asList(
                createModule("Welcome & Introduction", "Company history and mission", null, TrainingModule.MaterialType.VIDEO, 30, 0),
                createModule("HR Policies", "Leave, benefits, and workplace guidelines", null, TrainingModule.MaterialType.DOCUMENT, 45, 1),
                createModule("IT Setup", "Tools, access, and security policies", null, TrainingModule.MaterialType.LINK, 30, 2),
                createModule("Team Introduction", "Meet your team and stakeholders", null, TrainingModule.MaterialType.VIDEO, 20, 3),
                createModule("Onboarding Quiz", "Test your knowledge of company policies", null, TrainingModule.MaterialType.QUIZ, 15, 4)
        ));

        trainingRepository.saveAll(trainings);

        // Add related skills to trainings
        if (skillsMap.containsKey("React")) {
            trainings.get(0).addSkill(skillsMap.get("React"));
        }
        if (skillsMap.containsKey("Spring Boot")) {
            trainings.get(1).addSkill(skillsMap.get("Spring Boot"));
        }
        if (skillsMap.containsKey("AWS")) {
            trainings.get(2).addSkill(skillsMap.get("AWS"));
        }
        if (skillsMap.containsKey("Docker")) {
            trainings.get(6).addSkill(skillsMap.get("Docker"));
        }
        if (skillsMap.containsKey("Kubernetes")) {
            trainings.get(6).addSkill(skillsMap.get("Kubernetes"));
        }
        trainingRepository.saveAll(trainings);

        // Create training assignments for employees
        // Note: employees[0]=Admin, [1]=PM, [2]=HR, [3+]=Regular employees
        if (employees.size() >= 8) {
            // Admin (index 0) - Assign trainings but NOT completed (user must complete them)
            createTrainingAssignment(trainings.get(0), employees.get(0), TrainingAssignment.Status.NOT_STARTED, 0); // React
            createTrainingAssignment(trainings.get(4), employees.get(0), TrainingAssignment.Status.IN_PROGRESS, 30); // Agile
            createTrainingAssignment(trainings.get(7), employees.get(0), TrainingAssignment.Status.NOT_STARTED, 0); // Onboarding
            
            // PM (index 1)
            createTrainingAssignment(trainings.get(0), employees.get(1), TrainingAssignment.Status.IN_PROGRESS, 50); // React
            createTrainingAssignment(trainings.get(6), employees.get(1), TrainingAssignment.Status.IN_PROGRESS, 20); // Docker
            createTrainingAssignment(trainings.get(7), employees.get(1), TrainingAssignment.Status.NOT_STARTED, 0); // Onboarding
            
            // HR (index 2)
            createTrainingAssignment(trainings.get(0), employees.get(2), TrainingAssignment.Status.NOT_STARTED, 0); // React
            createTrainingAssignment(trainings.get(1), employees.get(2), TrainingAssignment.Status.IN_PROGRESS, 30); // Spring Boot
            createTrainingAssignment(trainings.get(7), employees.get(2), TrainingAssignment.Status.NOT_STARTED, 0); // Onboarding
            
            // Regular employees (index 3+)
            createTrainingAssignment(trainings.get(1), employees.get(3), TrainingAssignment.Status.NOT_STARTED, 0);
            createTrainingAssignment(trainings.get(2), employees.get(3), TrainingAssignment.Status.NOT_STARTED, 0);
            createTrainingAssignment(trainings.get(2), employees.get(4), TrainingAssignment.Status.IN_PROGRESS, 40);
            createTrainingAssignment(trainings.get(4), employees.get(4), TrainingAssignment.Status.NOT_STARTED, 0);
            createTrainingAssignment(trainings.get(6), employees.get(5), TrainingAssignment.Status.NOT_STARTED, 0);
        }

        log.info("Created {} trainings with modules and assignments", trainings.size());
    }

    private void addModulesToTraining(Training training, List<TrainingModule> modules) {
        for (TrainingModule module : modules) {
            module.setTraining(training);
        }
        trainingModuleRepository.saveAll(modules);
        training.setTotalModules(modules.size());
    }

    private TrainingModule createModule(String title, String description, String materialUrl, 
                                         TrainingModule.MaterialType materialType, int durationMinutes, int orderIndex) {
        return TrainingModule.builder()
                .title(title)
                .description(description)
                .materialUrl(materialUrl)
                .materialType(materialType)
                .durationMinutes(durationMinutes)
                .orderIndex(orderIndex)
                .isMandatory(true)
                .build();
    }

    private Training createTraining(String title, String description, Training.Category category, 
                                     Training.Difficulty difficulty, int durationHours) {
        return Training.builder()
                .title(title)
                .description(description)
                .category(category)
                .difficulty(difficulty)
                .durationHours(durationHours)
                .status(Training.Status.ACTIVE)
                .build();
    }

    private void createTrainingAssignment(Training training, Employee employee, 
                                           TrainingAssignment.Status status, int progress) {
        TrainingAssignment assignment = TrainingAssignment.builder()
                .training(training)
                .employee(employee)
                .assignedDate(LocalDate.now().minusDays((long)(Math.random() * 30)))
                .dueDate(LocalDate.now().plusDays((long)(Math.random() * 60)))
                .status(status)
                .progressPercentage(progress)
                .build();
        trainingAssignmentRepository.save(assignment);
    }

    private void createPermissions() {
        // Create all permissions
        List<Permission> permissions = Arrays.asList(
                // Dashboard
                createPermission("DASHBOARD_VIEW", "View Dashboard", "Dashboard", "Access to view dashboard"),
                
                // Employee Management
                createPermission("EMPLOYEE_VIEW", "View Employees", "Employee", "View employee list and details"),
                createPermission("EMPLOYEE_CREATE", "Create Employees", "Employee", "Create new employees"),
                createPermission("EMPLOYEE_EDIT", "Edit Employees", "Employee", "Edit employee details"),
                createPermission("EMPLOYEE_DELETE", "Delete Employees", "Employee", "Delete employees"),
                
                // Project Management
                createPermission("PROJECT_VIEW", "View Projects", "Project", "View project list and details"),
                createPermission("PROJECT_CREATE", "Create Projects", "Project", "Create new projects"),
                createPermission("PROJECT_EDIT", "Edit Projects", "Project", "Edit project details"),
                createPermission("PROJECT_DELETE", "Delete Projects", "Project", "Delete projects"),
                
                // Skill Management
                createPermission("SKILL_VIEW", "View Skills", "Skill", "View skills and categories"),
                createPermission("SKILL_MANAGE", "Manage Skills", "Skill", "Create, edit, delete skills"),
                
                // Training Management
                createPermission("TRAINING_VIEW", "View Trainings", "Training", "View training modules"),
                createPermission("TRAINING_MANAGE", "Manage Trainings", "Training", "Create, edit, delete trainings"),
                createPermission("TRAINING_ASSIGN", "Assign Trainings", "Training", "Assign trainings to employees"),
                
                // Allocation Management
                createPermission("ALLOCATION_VIEW", "View Allocations", "Allocation", "View allocations"),
                createPermission("ALLOCATION_MANAGE", "Manage Allocations", "Allocation", "Create and manage allocations"),
                
                // Reports
                createPermission("REPORT_VIEW", "View Reports", "Report", "Access reports"),
                createPermission("REPORT_EXPORT", "Export Reports", "Report", "Export reports to PDF/Excel"),
                
                // User Management
                createPermission("USER_VIEW", "View Users", "User", "View user list"),
                createPermission("USER_MANAGE", "Manage Users", "User", "Create, edit, delete users"),
                createPermission("ROLE_MANAGE", "Manage Roles", "User", "Manage role permissions"),
                
                // Forecasting
                createPermission("FORECASTING_VIEW", "View Forecasting", "Forecasting", "Access forecasting data")
        );
        permissionRepository.saveAll(permissions);
        log.info("Created {} permissions", permissions.size());

        // Assign permissions to roles
        assignDefaultRolePermissions();
    }

    private Permission createPermission(String code, String name, String module, String description) {
        return Permission.builder()
                .code(code)
                .name(name)
                .module(module)
                .description(description)
                .isActive(true)
                .build();
    }

    private void assignDefaultRolePermissions() {
        // Admin gets all permissions
        List<Permission> allPermissions = permissionRepository.findAll();
        for (Permission p : allPermissions) {
            rolePermissionRepository.save(RolePermission.builder()
                    .role(User.Role.ADMIN)
                    .permission(p)
                    .build());
        }

        // PM permissions
        List<String> pmPermissions = Arrays.asList(
                "DASHBOARD_VIEW", "EMPLOYEE_VIEW", "PROJECT_VIEW", "PROJECT_CREATE", "PROJECT_EDIT",
                "SKILL_VIEW", "TRAINING_VIEW", "ALLOCATION_VIEW", "ALLOCATION_MANAGE",
                "REPORT_VIEW", "REPORT_EXPORT", "FORECASTING_VIEW"
        );
        for (String code : pmPermissions) {
            permissionRepository.findByCode(code).ifPresent(p -> 
                rolePermissionRepository.save(RolePermission.builder()
                        .role(User.Role.PM)
                        .permission(p)
                        .build())
            );
        }

        // HR permissions
        List<String> hrPermissions = Arrays.asList(
                "DASHBOARD_VIEW", "EMPLOYEE_VIEW", "EMPLOYEE_CREATE", "EMPLOYEE_EDIT",
                "PROJECT_VIEW", "SKILL_VIEW", "SKILL_MANAGE",
                "TRAINING_VIEW", "TRAINING_MANAGE", "TRAINING_ASSIGN",
                "REPORT_VIEW", "FORECASTING_VIEW"
        );
        for (String code : hrPermissions) {
            permissionRepository.findByCode(code).ifPresent(p -> 
                rolePermissionRepository.save(RolePermission.builder()
                        .role(User.Role.HR)
                        .permission(p)
                        .build())
            );
        }

        // Employee permissions
        List<String> employeePermissions = Arrays.asList(
                "DASHBOARD_VIEW", "EMPLOYEE_VIEW", "PROJECT_VIEW", "SKILL_VIEW",
                "TRAINING_VIEW"
        );
        for (String code : employeePermissions) {
            permissionRepository.findByCode(code).ifPresent(p -> 
                rolePermissionRepository.save(RolePermission.builder()
                        .role(User.Role.EMPLOYEE)
                        .permission(p)
                        .build())
            );
        }

        log.info("Assigned default permissions to roles");
    }

    private List<Employee> createUsers() {
        List<Employee> userEmployees = new ArrayList<>();
        
        // Admin user with employee profile
        userEmployees.add(createUserWithEmployee("admin@rmp.com", "admin123", "Admin User", "IT", "System Administrator",
                User.Role.ADMIN, "EMP00001"));

        // PM user with employee profile  
        userEmployees.add(createUserWithEmployee("pm@rmp.com", "pm123", "John Smith", "Engineering", "Senior Project Manager",
                User.Role.PM, "EMP00002"));

        // HR user with employee profile
        userEmployees.add(createUserWithEmployee("hr@rmp.com", "hr123", "Sarah Johnson", "Human Resources", "HR Manager",
                User.Role.HR, "EMP00003"));
        
        return userEmployees;
    }

    private Employee createUserWithEmployee(String email, String password, String name, 
            String department, String designation, User.Role role, String employeeId) {
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .name(name)
                .enabled(true)
                .build();
        user.addRole(role);
        User savedUser = userRepository.save(user);

        Employee employee = Employee.builder()
                .employeeId(employeeId)
                .name(name)
                .email(email)
                .department(department)
                .designation(designation)
                .joinDate(LocalDate.now().minusYears(2))
                .maxFTE(1.0)  // 1 FTE = 8 hours/day
                .status(Employee.Status.ACTIVE)
                .availabilityStatus(Employee.AvailabilityStatus.AVAILABLE)
                .user(savedUser)
                .build();
        Employee savedEmployee = employeeRepository.save(employee);

        savedUser.setEmployee(savedEmployee);
        userRepository.save(savedUser);

        return savedEmployee;
    }

    private Map<String, Skill> createSkills() {
        List<Skill> skills = Arrays.asList(
                // Frontend
                createSkill("React", "FRONTEND", "A JavaScript library for building user interfaces"),
                createSkill("Angular", "FRONTEND", "TypeScript-based web application framework"),
                createSkill("Vue.js", "FRONTEND", "Progressive JavaScript framework"),
                createSkill("TypeScript", "FRONTEND", "Typed superset of JavaScript"),
                createSkill("HTML/CSS", "FRONTEND", "Web markup and styling"),
                createSkill("Tailwind CSS", "FRONTEND", "Utility-first CSS framework"),
                
                // Backend
                createSkill("Java", "BACKEND", "Object-oriented programming language"),
                createSkill("Spring Boot", "BACKEND", "Java-based framework for microservices"),
                createSkill("Node.js", "BACKEND", "JavaScript runtime environment"),
                createSkill("Python", "BACKEND", "High-level programming language"),
                createSkill("Go", "BACKEND", "Statically typed, compiled language"),
                createSkill(".NET Core", "BACKEND", "Cross-platform framework"),
                
                // Database
                createSkill("PostgreSQL", "DATABASE", "Open source relational database"),
                createSkill("MongoDB", "DATABASE", "NoSQL document database"),
                createSkill("MySQL", "DATABASE", "Popular open-source relational database"),
                createSkill("Redis", "DATABASE", "In-memory data structure store"),
                
                // DevOps
                createSkill("Docker", "DEVOPS", "Container platform"),
                createSkill("Kubernetes", "DEVOPS", "Container orchestration"),
                createSkill("AWS", "DEVOPS", "Amazon Web Services cloud platform"),
                createSkill("Azure", "DEVOPS", "Microsoft cloud platform"),
                createSkill("Jenkins", "DEVOPS", "Automation server for CI/CD"),
                createSkill("Terraform", "DEVOPS", "Infrastructure as code tool"),
                
                // Mobile
                createSkill("React Native", "MOBILE", "Cross-platform mobile framework"),
                createSkill("Flutter", "MOBILE", "UI toolkit for mobile apps"),
                createSkill("Swift", "MOBILE", "iOS development language"),
                createSkill("Kotlin", "MOBILE", "Android development language"),
                
                // Design
                createSkill("Figma", "DESIGN", "Collaborative interface design tool"),
                createSkill("Adobe XD", "DESIGN", "Vector-based UI/UX design tool"),
                createSkill("Sketch", "DESIGN", "Digital design toolkit")
        );
        
        skillRepository.saveAll(skills);
        
        Map<String, Skill> skillsMap = new HashMap<>();
        for (Skill skill : skills) {
            skillsMap.put(skill.getName(), skill);
        }
        return skillsMap;
    }

    private List<Employee> createEmployees(Map<String, Skill> skillsMap) {
        List<Employee> employees = new ArrayList<>();
        
        // Engineering department
        employees.add(createEmployeeWithSkills("EMP001", "John Smith", "john.smith@company.com", 
                "Engineering", "Senior Developer", Employee.Status.ACTIVE,
                skillsMap, "React", "TypeScript", "Node.js", "PostgreSQL"));
        
        employees.add(createEmployeeWithSkills("EMP002", "Michael Chen", "michael.chen@company.com",
                "Engineering", "Tech Lead", Employee.Status.ACTIVE,
                skillsMap, "Java", "Spring Boot", "AWS", "Docker"));
        
        employees.add(createEmployeeWithSkills("EMP003", "Amanda Williams", "amanda.w@company.com",
                "Engineering", "Full Stack Developer", Employee.Status.ACTIVE,
                skillsMap, "React", "Node.js", "MongoDB", "Docker"));
        
        employees.add(createEmployeeWithSkills("EMP004", "James Rodriguez", "james.r@company.com",
                "Engineering", "Backend Developer", Employee.Status.ACTIVE,
                skillsMap, "Java", "Spring Boot", "PostgreSQL", "Redis"));
        
        employees.add(createEmployeeWithSkills("EMP005", "Lisa Thompson", "lisa.t@company.com",
                "Engineering", "Frontend Developer", Employee.Status.ACTIVE,
                skillsMap, "React", "Angular", "TypeScript", "Tailwind CSS"));
        
        // Design department
        employees.add(createEmployeeWithSkills("EMP006", "Sarah Johnson", "sarah.j@company.com",
                "Design", "UI/UX Designer", Employee.Status.ACTIVE,
                skillsMap, "Figma", "Adobe XD", "Sketch"));
        
        employees.add(createEmployeeWithSkills("EMP007", "David Park", "david.p@company.com",
                "Design", "Senior Designer", Employee.Status.ACTIVE,
                skillsMap, "Figma", "HTML/CSS", "Tailwind CSS"));
        
        // QA department
        employees.add(createEmployeeWithSkills("EMP008", "Emily Brown", "emily.b@company.com",
                "QA", "QA Engineer", Employee.Status.ACTIVE,
                skillsMap, "Java", "Python"));
        
        employees.add(createEmployeeWithSkills("EMP009", "Robert Kim", "robert.k@company.com",
                "QA", "Senior QA Engineer", Employee.Status.ACTIVE,
                skillsMap, "Python", "TypeScript"));
        
        // DevOps department
        employees.add(createEmployeeWithSkills("EMP010", "Chris Martinez", "chris.m@company.com",
                "DevOps", "DevOps Engineer", Employee.Status.ACTIVE,
                skillsMap, "Docker", "Kubernetes", "AWS", "Terraform"));
        
        employees.add(createEmployeeWithSkills("EMP011", "Kevin Brown", "kevin.b@company.com",
                "DevOps", "Cloud Engineer", Employee.Status.ACTIVE,
                skillsMap, "AWS", "Azure", "Docker", "Jenkins"));
        
        // Mobile development
        employees.add(createEmployeeWithSkills("EMP012", "Jennifer Lee", "jennifer.l@company.com",
                "Engineering", "Mobile Developer", Employee.Status.ACTIVE,
                skillsMap, "React Native", "Flutter", "TypeScript"));
        
        // More employees for bench/allocation variety
        employees.add(createEmployeeWithSkills("EMP013", "Daniel Wilson", "daniel.w@company.com",
                "Engineering", "Junior Developer", Employee.Status.ACTIVE,
                skillsMap, "React", "JavaScript"));
        
        employees.add(createEmployeeWithSkills("EMP014", "Michelle Garcia", "michelle.g@company.com",
                "Engineering", "Backend Developer", Employee.Status.ACTIVE,
                skillsMap, "Python", "PostgreSQL", "Docker"));
        
        employees.add(createEmployeeWithSkills("EMP015", "Alex Turner", "alex.t@company.com",
                "Engineering", "Full Stack Developer", Employee.Status.ON_LEAVE,
                skillsMap, "React", "Node.js", "MongoDB"));
        
        employeeRepository.saveAll(employees);
        return employees;
    }

    private List<Project> createProjects() {
        List<Project> projects = Arrays.asList(
                createProject("Project Alpha", "TechCorp Inc.", 
                        "Enterprise resource planning system modernization with modern tech stack",
                        Project.Status.IN_PROGRESS, Project.Priority.HIGH, 65, 250000),
                
                createProject("Project Beta", "HealthFirst", 
                        "Mobile application development for healthcare management",
                        Project.Status.IN_PROGRESS, Project.Priority.CRITICAL, 35, 180000),
                
                createProject("Project Gamma", "DataViz Corp", 
                        "Data analytics platform implementation with real-time dashboards",
                        Project.Status.NOT_STARTED, Project.Priority.MEDIUM, 0, 150000),
                
                createProject("Project Delta", "ShopEasy", 
                        "E-commerce platform migration to microservices architecture",
                        Project.Status.COMPLETED, Project.Priority.LOW, 100, 120000),
                
                createProject("Project Epsilon", "FinanceHub", 
                        "Banking application security enhancement and audit compliance",
                        Project.Status.IN_PROGRESS, Project.Priority.HIGH, 45, 200000),
                
                createProject("Project Zeta", "EduTech Solutions", 
                        "Online learning platform with AI-powered recommendations",
                        Project.Status.ON_HOLD, Project.Priority.MEDIUM, 25, 175000)
        );
        
        projectRepository.saveAll(projects);
        return projects;
    }

    private void createAllocations(List<Employee> employees, List<Project> projects) {
        List<Allocation> allocations = new ArrayList<>();
        
        // FTE allocations (1 FTE = 8 hours/day)
        // Project Alpha (index 0) - 4 team members
        allocations.add(createAllocation(employees.get(1), projects.get(0), 0.6, "Tech Lead"));       // 0.6 FTE = 4.8 hrs/day
        allocations.add(createAllocation(employees.get(0), projects.get(0), 0.4, "Senior Developer")); // 0.4 FTE = 3.2 hrs/day
        allocations.add(createAllocation(employees.get(5), projects.get(0), 1.0, "UI/UX Designer"));   // 1.0 FTE = 8 hrs/day
        allocations.add(createAllocation(employees.get(7), projects.get(0), 0.5, "QA Engineer"));      // 0.5 FTE = 4 hrs/day
        
        // Project Beta (index 1) - 3 team members
        allocations.add(createAllocation(employees.get(0), projects.get(1), 0.6, "Lead Developer"));   // 0.6 FTE
        allocations.add(createAllocation(employees.get(11), projects.get(1), 1.0, "Mobile Developer")); // 1.0 FTE
        allocations.add(createAllocation(employees.get(8), projects.get(1), 0.5, "QA Engineer"));      // 0.5 FTE
        
        // Project Epsilon (index 4) - 4 team members
        allocations.add(createAllocation(employees.get(3), projects.get(4), 0.8, "Backend Developer")); // 0.8 FTE
        allocations.add(createAllocation(employees.get(4), projects.get(4), 1.0, "Frontend Developer")); // 1.0 FTE
        allocations.add(createAllocation(employees.get(9), projects.get(4), 0.6, "DevOps Engineer"));  // 0.6 FTE
        allocations.add(createAllocation(employees.get(6), projects.get(4), 0.5, "Designer"));         // 0.5 FTE
        
        // Some employees with partial allocations (split across projects)
        allocations.add(createAllocation(employees.get(2), projects.get(0), 0.5, "Full Stack Developer")); // 0.5 FTE
        allocations.add(createAllocation(employees.get(2), projects.get(1), 0.5, "Full Stack Developer")); // 0.5 FTE = total 1.0 FTE
        
        // Over-allocated employee for demo (total > 1.0 FTE)
        allocations.add(createAllocation(employees.get(1), projects.get(4), 0.5, "Consultant")); // 0.5 + 0.6 = 1.1 FTE (over-allocated)
        
        allocationRepository.saveAll(allocations);
    }

    private void createSkillCategories() {
        List<SkillCategory> categories = Arrays.asList(
                SkillCategory.builder().name("Frontend").code("FRONTEND").color("#3b82f6").displayOrder(1).build(),
                SkillCategory.builder().name("Backend").code("BACKEND").color("#10b981").displayOrder(2).build(),
                SkillCategory.builder().name("Database").code("DATABASE").color("#f59e0b").displayOrder(3).build(),
                SkillCategory.builder().name("DevOps").code("DEVOPS").color("#8b5cf6").displayOrder(4).build(),
                SkillCategory.builder().name("Mobile").code("MOBILE").color("#ec4899").displayOrder(5).build(),
                SkillCategory.builder().name("Design").code("DESIGN").color("#06b6d4").displayOrder(6).build(),
                SkillCategory.builder().name("Soft Skills").code("SOFT_SKILL").color("#14b8a6").displayOrder(7).build(),
                SkillCategory.builder().name("Domain").code("DOMAIN").color("#f97316").displayOrder(8).build(),
                SkillCategory.builder().name("Other").code("OTHER").color("#64748b").displayOrder(99).build()
        );
        skillCategoryRepository.saveAll(categories);
        log.info("Created {} skill categories", categories.size());
    }

    private Skill createSkill(String name, String category, String description) {
        return Skill.builder()
                .name(name)
                .category(category)
                .description(description)
                .build();
    }

    private Employee createEmployeeWithSkills(String empId, String name, String email, 
            String dept, String designation, Employee.Status status, 
            Map<String, Skill> skillsMap, String... skillNames) {
        
        // Create User account for the employee
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode("password123")) // Default password
                .name(name)
                .enabled(true)
                .build();
        user.addRole(User.Role.EMPLOYEE);
        User savedUser = userRepository.save(user);

        // Create Employee with user link
        Employee employee = Employee.builder()
                .employeeId(empId)
                .name(name)
                .email(email)
                .department(dept)
                .designation(designation)
                .joinDate(LocalDate.now().minusMonths((long) (Math.random() * 24) + 1))
                .status(status)
                .maxFTE(1.0)  // 1 FTE = 8 hours/day
                .availabilityStatus(Employee.AvailabilityStatus.AVAILABLE)
                .user(savedUser)
                .build();
        
        // Add skills
        for (String skillName : skillNames) {
            Skill skill = skillsMap.get(skillName);
            if (skill != null) {
                EmployeeSkill employeeSkill = EmployeeSkill.builder()
                        .employee(employee)
                        .skill(skill)
                        .level(getRandomLevel())
                        .yearsOfExperience((int) (Math.random() * 8) + 1)
                        .build();
                employee.addSkill(employeeSkill);
            }
        }
        
        // Save and link back
        Employee savedEmployee = employeeRepository.save(employee);
        savedUser.setEmployee(savedEmployee);
        userRepository.save(savedUser);
        
        return savedEmployee;
    }

    private EmployeeSkill.Level getRandomLevel() {
        EmployeeSkill.Level[] levels = EmployeeSkill.Level.values();
        return levels[(int) (Math.random() * levels.length)];
    }

    private Project createProject(String name, String client, String description,
            Project.Status status, Project.Priority priority, int progress, int budget) {
        LocalDate startDate = status == Project.Status.COMPLETED 
                ? LocalDate.now().minusMonths(6) 
                : LocalDate.now().minusMonths((long) (Math.random() * 3) + 1);
        
        LocalDate endDate = status == Project.Status.COMPLETED 
                ? LocalDate.now().minusMonths(1) 
                : LocalDate.now().plusMonths((long) (Math.random() * 6) + 3);
        
        return Project.builder()
                .name(name)
                .description(description)
                .client(client)
                .status(status)
                .priority(priority)
                .startDate(startDate)
                .endDate(endDate)
                .budget(new BigDecimal(budget))
                .progress(progress)
                .build();
    }

    private Allocation createAllocation(Employee employee, Project project, double fte, String role) {
        return Allocation.builder()
                .employee(employee)
                .project(project)
                .fte(fte)  // FTE: 1.0 = 8 hours/day
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .role(role)
                .status(project.getStatus() == Project.Status.COMPLETED 
                        ? Allocation.Status.COMPLETED 
                        : Allocation.Status.ACTIVE)
                .billable(true)
                .build();
    }
}
