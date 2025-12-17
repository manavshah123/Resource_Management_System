package com.wishtree.rmp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeCreateDto {

    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Designation is required")
    private String designation;

    private String location;

    private LocalDate joinDate;

    private String status;

    private String bio;

    private Long managerId;

    // Maximum FTE capacity (1 FTE = 8 hours/day)
    @Builder.Default
    private Double maxFTE = 1.0;
    
    // For backward compatibility
    private Integer maxFT;
    
    // Helper to get maxFTE from either field
    public Double getMaxFTE() {
        if (maxFTE != null) return maxFTE;
        if (maxFT != null) return maxFT / 100.0;
        return 1.0;
    }
}

