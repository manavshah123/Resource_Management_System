package com.wishtree.rmp.dto;

import com.wishtree.rmp.entity.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {

    private Long id;
    private String name;
    private String description;
    private String client;
    private String clientName; // Alias for frontend compatibility
    private String status;
    private String priority;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer progress;
    private BigDecimal budget;
    private BigDecimal spentBudget;
    private Integer teamSize;
    private Long managerId;
    private String managerName;
    private List<String> requiredSkills;        // Skill names for display
    private List<Long> requiredSkillIds;         // Skill IDs for editing
    private List<SkillDto> techStack;            // Full skill objects with details
    private List<AllocationDto> teamMembers;

    public static ProjectDto fromEntity(Project project) {
        List<String> skillNames = project.getRequiredSkills() != null ?
                project.getRequiredSkills().stream()
                        .map(skill -> skill.getName())
                        .collect(Collectors.toList()) : List.of();
        
        List<Long> skillIds = project.getRequiredSkills() != null ?
                project.getRequiredSkills().stream()
                        .map(skill -> skill.getId())
                        .collect(Collectors.toList()) : List.of();
        
        List<SkillDto> techStackDtos = project.getRequiredSkills() != null ?
                project.getRequiredSkills().stream()
                        .map(SkillDto::fromEntity)
                        .collect(Collectors.toList()) : List.of();
        
        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .client(project.getClient())
                .clientName(project.getClient()) // Alias for frontend
                .status(project.getStatus().name())
                .priority(project.getPriority() != null ? project.getPriority().name() : null)
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .progress(project.getProgress())
                .budget(project.getBudget())
                .spentBudget(project.getSpentBudget())
                .teamSize(project.getTeamSize())
                .managerId(project.getManager() != null ? project.getManager().getId() : null)
                .managerName(project.getManager() != null ? project.getManager().getName() : null)
                .requiredSkills(skillNames)
                .requiredSkillIds(skillIds)
                .techStack(techStackDtos)
                .build();
    }
}

