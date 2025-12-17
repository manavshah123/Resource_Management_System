package com.wishtree.rmp.dto;

import com.wishtree.rmp.entity.TrainingAssignment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingAssignmentDto {

    private Long id;
    private Long trainingId;
    private String trainingTitle;
    private String trainingDescription;
    private String trainingCategory;
    private String trainingDifficulty;
    private Integer totalModules;
    private Integer completedModules;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private LocalDate assignedDate;
    private LocalDate dueDate;
    private String status;
    private Integer progressPercentage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String remarks;
    private String employeeNotes;
    private String proofUrl;
    private Boolean skillAdded;
    private Boolean isOverdue;
    private List<TrainingModuleDto> modules;
    private List<String> relatedSkills;
    
    // Certificate info
    private Boolean hasCertificate;
    private String certificateNumber;
    private String certificateIssuedDate;

    public static TrainingAssignmentDto fromEntity(TrainingAssignment assignment) {
        return TrainingAssignmentDto.builder()
                .id(assignment.getId())
                .trainingId(assignment.getTraining().getId())
                .trainingTitle(assignment.getTraining().getTitle())
                .trainingDescription(assignment.getTraining().getDescription())
                .trainingCategory(assignment.getTraining().getCategory().name())
                .trainingDifficulty(assignment.getTraining().getDifficulty().name())
                .totalModules(assignment.getTraining().getTotalModules())
                .employeeId(assignment.getEmployee().getId())
                .employeeName(assignment.getEmployee().getName())
                .employeeEmail(assignment.getEmployee().getEmail())
                .assignedDate(assignment.getAssignedDate())
                .dueDate(assignment.getDueDate())
                .status(assignment.getStatus().name())
                .progressPercentage(assignment.getProgressPercentage())
                .startedAt(assignment.getStartedAt())
                .completedAt(assignment.getCompletedAt())
                .remarks(assignment.getRemarks())
                .employeeNotes(assignment.getEmployeeNotes())
                .proofUrl(assignment.getProofUrl())
                .skillAdded(assignment.getSkillAdded())
                .isOverdue(assignment.isOverdue())
                .build();
    }

    public static TrainingAssignmentDto fromEntityWithModules(TrainingAssignment assignment, List<TrainingModuleDto> modules, int completedModules) {
        TrainingAssignmentDto dto = fromEntity(assignment);
        dto.setModules(modules);
        dto.setCompletedModules(completedModules);
        dto.setTotalModules(modules != null ? modules.size() : 0);
        if (assignment.getTraining().getRelatedSkills() != null) {
            dto.setRelatedSkills(assignment.getTraining().getRelatedSkills().stream()
                    .map(s -> s.getName())
                    .toList());
        }
        return dto;
    }
}

