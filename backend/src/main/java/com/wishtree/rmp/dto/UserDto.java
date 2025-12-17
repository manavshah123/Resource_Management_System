package com.wishtree.rmp.dto;

import com.wishtree.rmp.entity.Employee;
import com.wishtree.rmp.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long id;
    private String email;
    private String name;
    private String phone;
    private Set<String> roles;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private Set<String> permissions;

    // Employee info
    private Long employeeId;
    private String employeeCode;
    private String department;
    private String designation;
    private String location;
    private LocalDate joinDate;
    private Integer maxFT;
    private Integer currentAllocation;
    private String status;
    private String availabilityStatus;

    public static UserDto fromEntity(User user) {
        UserDtoBuilder builder = UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .roles(user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()))
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt());

        // Add employee details if linked
        Employee emp = user.getEmployee();
        if (emp != null) {
            builder.employeeId(emp.getId())
                    .employeeCode(emp.getEmployeeId())
                    .department(emp.getDepartment())
                    .designation(emp.getDesignation())
                    .location(emp.getLocation())
                    .joinDate(emp.getJoinDate())
                    .maxFT((int)((emp.getMaxFTE() != null ? emp.getMaxFTE() : 1.0) * 100))
                    .currentAllocation(emp.getCurrentAllocation())
                    .status(emp.getStatus() != null ? emp.getStatus().name() : null)
                    .availabilityStatus(emp.getAvailabilityStatus() != null ? emp.getAvailabilityStatus().name() : null);
        }

        return builder.build();
    }

    public static UserDto fromEntityWithPermissions(User user, Set<String> permissions) {
        UserDto dto = fromEntity(user);
        dto.setPermissions(permissions);
        return dto;
    }
}
