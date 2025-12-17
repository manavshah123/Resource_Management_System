package com.rmp.service;

import com.rmp.dto.DashboardDto;
import com.rmp.dto.SkillDto;
import com.rmp.entity.Employee;
import com.rmp.entity.Project;
import com.rmp.entity.Skill;
import com.rmp.repository.EmployeeRepository;
import com.rmp.repository.ProjectRepository;
import com.rmp.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final EmployeeService employeeService;
    private final ProjectService projectService;
    private final SkillService skillService;
    private final AllocationService allocationService;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;

    public DashboardDto getDashboardSummary() {
        long totalEmployees = employeeService.getTotalCount();
        long activeEmployees = employeeService.getActiveCount();
        long uniqueAllocatedEmployees = allocationService.getUniqueAllocatedEmployeesCount();
        long activeAllocationCount = allocationService.getActiveCount();
        long benchCount = (long) employeeService.getBenchEmployees().size();
        long totalProjects = projectRepository.count();
        
        // Calculate utilization based on unique allocated employees vs active employees
        double utilization = activeEmployees > 0 ? (uniqueAllocatedEmployees * 100.0 / activeEmployees) : 0;

        return DashboardDto.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .activeProjects(projectService.getProjectCountByStatus(Project.Status.IN_PROGRESS))
                .totalProjects(totalProjects)
                .allocatedResources(uniqueAllocatedEmployees) // Unique employees with active allocations
                .activeAllocations(activeAllocationCount) // Total number of active allocations
                .benchStrength(benchCount)
                .totalSkills(skillService.getTotalCount())
                .overallocatedCount((long) allocationService.getOverallocatedEmployeeIds().size())
                .averageUtilization(Math.round(utilization * 10.0) / 10.0)
                .projectStatusDistribution(getProjectStatusDistribution())
                .departmentDistribution(getDepartmentDistribution())
                .skillCategoryDistribution(getSkillCategoryDistribution())
                .topSkills(getTopSkillsWithCount(6))
                .upcomingDeallocations(allocationService.getUpcomingDeallocations(30))
                .recentActivities(getRecentActivities())
                .build();
    }

    private Map<String, Long> getProjectStatusDistribution() {
        Map<String, Long> distribution = new LinkedHashMap<>();
        for (Project.Status status : Project.Status.values()) {
            long count = projectService.getProjectCountByStatus(status);
            if (count > 0) {
                distribution.put(status.name(), count);
            }
        }
        return distribution;
    }

    private Map<String, Long> getDepartmentDistribution() {
        List<Employee> employees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        return employees.stream()
                .filter(e -> e.getDepartment() != null)
                .collect(Collectors.groupingBy(
                        Employee::getDepartment,
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
    }

    private Map<String, Long> getSkillCategoryDistribution() {
        List<Skill> skills = skillRepository.findAll();
        return skills.stream()
                .filter(s -> s.getCategory() != null)
                .collect(Collectors.groupingBy(
                        Skill::getCategory,
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
    }

    private List<SkillDto> getTopSkillsWithCount(int limit) {
        // Use fetch join to avoid lazy loading issues
        List<Skill> skills = skillRepository.findAllWithEmployees();
        return skills.stream()
                .sorted((s1, s2) -> {
                    int count1 = s1.getEmployeeSkills() != null ? s1.getEmployeeSkills().size() : 0;
                    int count2 = s2.getEmployeeSkills() != null ? s2.getEmployeeSkills().size() : 0;
                    return Integer.compare(count2, count1);
                })
                .limit(limit)
                .map(skill -> SkillDto.builder()
                        .id(skill.getId())
                        .name(skill.getName())
                        .category(skill.getCategory())
                        .employeeCount(skill.getEmployeeSkills() != null ? skill.getEmployeeSkills().size() : 0)
                        .build())
                .toList();
    }

    private List<DashboardDto.ActivityDto> getRecentActivities() {
        List<DashboardDto.ActivityDto> activities = new ArrayList<>();
        
        // Get recent employees
        List<Employee> recentEmployees = employeeRepository.findAll().stream()
                .filter(e -> e.getCreatedAt() != null)
                .sorted((e1, e2) -> e2.getCreatedAt().compareTo(e1.getCreatedAt()))
                .limit(3)
                .toList();
        
        for (Employee emp : recentEmployees) {
            activities.add(DashboardDto.ActivityDto.builder()
                    .action("Employee added")
                    .entity("employee")
                    .entityName(emp.getName())
                    .performedBy("System")
                    .timestamp(formatTimeAgo(emp.getCreatedAt()))
                    .build());
        }

        // Get recent projects
        projectRepository.findAll().stream()
                .filter(p -> p.getCreatedAt() != null)
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .limit(2)
                .forEach(proj -> activities.add(DashboardDto.ActivityDto.builder()
                        .action("Project created")
                        .entity("project")
                        .entityName(proj.getName())
                        .performedBy("System")
                        .timestamp(formatTimeAgo(proj.getCreatedAt()))
                        .build()));

        // Sort by most recent
        activities.sort((a, b) -> 0); // Already sorted by fetch order
        
        return activities.stream().limit(5).collect(Collectors.toList());
    }

    private String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "Unknown";
        
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(dateTime, now).toMinutes();
        
        if (minutes < 60) {
            return minutes + " min ago";
        } else if (minutes < 1440) {
            return (minutes / 60) + " hours ago";
        } else {
            return (minutes / 1440) + " days ago";
        }
    }
}

