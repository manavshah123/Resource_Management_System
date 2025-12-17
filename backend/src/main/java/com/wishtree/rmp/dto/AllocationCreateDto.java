package com.wishtree.rmp.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
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
public class AllocationCreateDto {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    // FTE - Full Time Equivalent (1 FTE = 8 hours/day)
    // Either fte or allocationPercentage can be provided
    @Min(value = 0, message = "FTE must be positive")
    @Max(value = 2, message = "FTE cannot exceed 2.0")
    private Double fte;
    
    // Allocation percentage (for backward compatibility, will be converted to FTE)
    @Min(value = 1, message = "Allocation must be at least 1%")
    @Max(value = 200, message = "Allocation cannot exceed 200%")
    private Integer allocationPercentage;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private String role;

    @Builder.Default
    private boolean billable = true;

    private String notes;
    
    // Assigned techstack/skill IDs - what technologies this person will work on
    private List<Long> assignedSkillIds;
}

