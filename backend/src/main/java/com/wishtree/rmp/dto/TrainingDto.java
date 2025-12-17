package com.wishtree.rmp.dto;

import com.wishtree.rmp.entity.Training;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingDto {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String difficulty;
    private Integer durationHours;
    private LocalDate dueDate;
    private String attachmentUrl;
    private String videoUrl;
    private String externalLink;
    private String status;
    private List<SkillDto> relatedSkills;
    private List<TrainingModuleDto> modules;
    private Integer totalModules;
    private Integer assignedCount;
    private Integer completedCount;
    private Double completionRate;
    private Double averageProgress;

    public static TrainingDto fromEntity(Training training) {
        TrainingDtoBuilder builder = TrainingDto.builder()
                .id(training.getId())
                .title(training.getTitle())
                .description(training.getDescription())
                .category(training.getCategory().name())
                .difficulty(training.getDifficulty().name())
                .durationHours(training.getDurationHours())
                .dueDate(training.getDueDate())
                .attachmentUrl(training.getAttachmentUrl())
                .videoUrl(training.getVideoUrl())
                .externalLink(training.getExternalLink())
                .status(training.getStatus().name())
                .totalModules(training.getTotalModules());

        if (training.getRelatedSkills() != null) {
            builder.relatedSkills(training.getRelatedSkills().stream()
                    .map(SkillDto::fromEntity)
                    .collect(Collectors.toList()));
        }

        return builder.build();
    }

    public static TrainingDto fromEntityWithModules(Training training) {
        TrainingDto dto = fromEntity(training);
        if (training.getModules() != null) {
            dto.setModules(training.getModules().stream()
                    .map(TrainingModuleDto::fromEntity)
                    .collect(Collectors.toList()));
            dto.setTotalModules(training.getModules().size());
        }
        return dto;
    }

    public static TrainingDto fromEntityWithStats(Training training, int assignedCount, int completedCount, double avgProgress) {
        TrainingDto dto = fromEntity(training);
        dto.setAssignedCount(assignedCount);
        dto.setCompletedCount(completedCount);
        dto.setCompletionRate(assignedCount > 0 ? (completedCount * 100.0 / assignedCount) : 0);
        dto.setAverageProgress(avgProgress);
        return dto;
    }
}

