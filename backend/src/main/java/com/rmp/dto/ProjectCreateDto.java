package com.rmp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectCreateDto {

    @NotBlank(message = "Project name is required")
    private String name;

    private String description;

    @NotBlank(message = "Client is required")
    private String client;

    private String status;

    private String priority;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private BigDecimal budget;

    private Long managerId;

    private List<Long> requiredSkillIds;
}

