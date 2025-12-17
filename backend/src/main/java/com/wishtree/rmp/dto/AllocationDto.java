package com.wishtree.rmp.dto;

import com.wishtree.rmp.entity.Allocation;
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
public class AllocationDto {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeDepartment;
    private Long projectId;
    private String projectName;
    private String projectClient;
    
    // FTE - Full Time Equivalent (1 FTE = 8 hours/day)
    private Double fte;
    
    // Hours per day (calculated from FTE)
    private Double hoursPerDay;
    
    // Percentage (for backward compatibility, 1 FTE = 100%)
    private Integer allocationPercentage;
    
    private LocalDate startDate;
    private LocalDate endDate;
    private String role;
    private String status;
    private boolean billable;
    private String notes;
    
    // Assigned techstack/skills for this allocation
    private List<SkillDto> assignedSkills;

    public static AllocationDto fromEntity(Allocation allocation) {
        Double fte = allocation.getFte() != null ? allocation.getFte() : 0.0;
        
        List<SkillDto> skills = allocation.getAssignedSkills() != null ?
                allocation.getAssignedSkills().stream()
                        .map(SkillDto::fromEntity)
                        .collect(Collectors.toList()) : List.of();
        
        return AllocationDto.builder()
                .id(allocation.getId())
                .employeeId(allocation.getEmployee().getId())
                .employeeName(allocation.getEmployee().getName())
                .employeeDepartment(allocation.getEmployee().getDepartment())
                .projectId(allocation.getProject().getId())
                .projectName(allocation.getProject().getName())
                .projectClient(allocation.getProject().getClient())
                .fte(fte)
                .hoursPerDay(fte * 8)
                .allocationPercentage((int)(fte * 100))
                .startDate(allocation.getStartDate())
                .endDate(allocation.getEndDate())
                .role(allocation.getRole())
                .status(allocation.getStatus().name())
                .billable(allocation.isBillable())
                .notes(allocation.getNotes())
                .assignedSkills(skills)
                .build();
    }
}

