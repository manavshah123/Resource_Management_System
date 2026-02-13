package com.rmp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Name is required")
    private String name;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private Set<String> roles;

    private Boolean enabled;

    // Employee fields - when creating a user, employee is also created
    private String phone;
    private String department;
    private String designation;
    private String location;
    private LocalDate joinDate;
    
    // FTE capacity (1.0 = 8 hours/day)
    private Double maxFTE;
    
    // For backward compatibility
    private Integer maxFT;
    
    private Long managerId;
    
    // Helper to get maxFTE from either field
    public Double getMaxFTE() {
        if (maxFTE != null) return maxFTE;
        if (maxFT != null) return maxFT / 100.0;
        return null;
    }
}

