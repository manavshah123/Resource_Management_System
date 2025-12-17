package com.rmp.dto;

import com.rmp.entity.Employee;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDto {

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
    private String availabilityStatus;
    private String bio;
    private String avatar;
    
    // FTE - Full Time Equivalent (1 FTE = 8 hours/day)
    private Double maxFTE;
    private Double currentFTE;
    private Double availableFTE;
    private Double hoursPerDay;  // Current allocated hours per day
    private Double availableHoursPerDay;  // Available hours per day
    
    // Percentage (for backward compatibility)
    private Integer maxFT;
    private Integer allocationPercentage;
    private Integer availableFT;
    
    private Long managerId;
    private String managerName;
    private List<EmployeeSkillDto> skills;
    private List<AllocationDto> currentAllocations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeSkillDto {
        private Long id;
        private String name;
        private String category;
        private String level;
        private Integer yearsOfExperience;
    }

    public static EmployeeDto fromEntity(Employee employee) {
        return fromEntity(employee, null);
    }

    public static EmployeeDto fromEntity(Employee employee, Integer allocationPercentage) {
        List<EmployeeSkillDto> skillDtos = null;
        try {
            if (employee.getSkills() != null && !employee.getSkills().isEmpty()) {
                skillDtos = employee.getSkills().stream()
                        .map(es -> EmployeeSkillDto.builder()
                                .id(es.getSkill().getId())
                                .name(es.getSkill().getName())
                                .category(es.getSkill().getCategory())
                                .level(es.getLevel().name())
                                .yearsOfExperience(es.getYearsOfExperience())
                                .build())
                        .toList();
            }
        } catch (Exception e) {
            // Skills not loaded, leave as null
        }
        
        // Calculate FTE values
        Double currentFTE = 0.0;
        if (allocationPercentage != null) {
            currentFTE = allocationPercentage / 100.0;
        } else {
            try {
                if (employee.getAllocations() != null) {
                    currentFTE = employee.getAllocations().stream()
                            .filter(a -> a.getStatus() == com.rmp.entity.Allocation.Status.ACTIVE)
                            .mapToDouble(a -> a.getFte() != null ? a.getFte() : 0)
                            .sum();
                }
            } catch (Exception e) {
                currentFTE = 0.0;
            }
        }
        
        Double maxFTE = employee.getMaxFTE() != null ? employee.getMaxFTE() : 1.0;
        Double availableFTE = Math.max(0, maxFTE - currentFTE);
        
        // Convert to percentage for backward compatibility
        Integer allocation = (int)(currentFTE * 100);
        Integer maxFTPercent = (int)(maxFTE * 100);
        Integer availableFTPercent = (int)(availableFTE * 100);
        
        return EmployeeDto.builder()
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
                .availabilityStatus(employee.getAvailabilityStatus() != null ? employee.getAvailabilityStatus().name() : null)
                .bio(employee.getBio())
                .avatar(employee.getAvatar())
                // FTE values
                .maxFTE(maxFTE)
                .currentFTE(currentFTE)
                .availableFTE(availableFTE)
                .hoursPerDay(currentFTE * 8)
                .availableHoursPerDay(availableFTE * 8)
                // Percentage values (backward compatibility)
                .maxFT(maxFTPercent)
                .allocationPercentage(allocation)
                .availableFT(availableFTPercent)
                .managerId(employee.getManager() != null ? employee.getManager().getId() : null)
                .managerName(employee.getManager() != null ? employee.getManager().getName() : null)
                .skills(skillDtos)
                .build();
    }
}

