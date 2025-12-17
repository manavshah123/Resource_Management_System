package com.rmp.dto;

import com.rmp.entity.Employee;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeProfileDto {

    private Long id;
    private String employeeId;
    private String name;
    private String email;
    private String phone;
    private String department;
    private String designation;
    private String location;
    private LocalDate joinDate;
    private String status;
    private String bio;
    private String avatar;
    
    // Manager info
    private Long managerId;
    private String managerName;
    
    // FT Allocation
    private Integer maxFT;
    private Integer currentAllocation;
    private Integer availableFT;
    private String availabilityStatus;
    
    // Skills
    private List<SkillInfo> skills;
    
    // Current Projects
    private List<ProjectAssignment> currentProjects;
    
    // Assignment History
    private List<AssignmentHistory> assignmentHistory;
    
    // Statistics
    private EmployeeStats stats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillInfo {
        private Long id;
        private String name;
        private String category;
        private String level;
        private Integer yearsOfExperience;
        private Boolean isPrimary;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectAssignment {
        private Long projectId;
        private String projectName;
        private String client;
        private String role;
        private Integer allocationPercentage;
        private LocalDate startDate;
        private LocalDate endDate;
        private String projectStatus;
        private Boolean isBillable;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentHistory {
        private Long projectId;
        private String projectName;
        private String client;
        private String role;
        private Integer allocationPercentage;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private Integer durationDays;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeStats {
        private Integer totalProjectsWorked;
        private Integer currentProjectsCount;
        private Double averageAllocation;
        private Integer totalDaysWorked;
        private Integer skillsCount;
    }

    public static EmployeeProfileDto fromEntity(
            Employee employee, 
            List<SkillInfo> skills,
            List<ProjectAssignment> currentProjects,
            List<AssignmentHistory> assignmentHistory,
            EmployeeStats stats) {
        
        int currentAllocation = currentProjects.stream()
                .mapToInt(ProjectAssignment::getAllocationPercentage)
                .sum();
        int maxFT = (int)((employee.getMaxFTE() != null ? employee.getMaxFTE() : 1.0) * 100);
        int availableFT = maxFT - currentAllocation;
        
        String availabilityStatus;
        if (currentAllocation == 0) {
            availabilityStatus = "AVAILABLE";
        } else if (currentAllocation >= maxFT) {
            availabilityStatus = "FULLY_ALLOCATED";
        } else if (currentAllocation > maxFT) {
            availabilityStatus = "OVER_ALLOCATED";
        } else {
            availabilityStatus = "PARTIALLY_ALLOCATED";
        }
        
        return EmployeeProfileDto.builder()
                .id(employee.getId())
                .employeeId(employee.getEmployeeId())
                .name(employee.getName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .department(employee.getDepartment())
                .designation(employee.getDesignation())
                .location(employee.getLocation())
                .joinDate(employee.getJoinDate())
                .status(employee.getStatus().name())
                .bio(employee.getBio())
                .avatar(employee.getAvatar())
                .managerId(employee.getManager() != null ? employee.getManager().getId() : null)
                .managerName(employee.getManager() != null ? employee.getManager().getName() : null)
                .maxFT(maxFT)
                .currentAllocation(currentAllocation)
                .availableFT(availableFT)
                .availabilityStatus(availabilityStatus)
                .skills(skills)
                .currentProjects(currentProjects)
                .assignmentHistory(assignmentHistory)
                .stats(stats)
                .build();
    }
}
