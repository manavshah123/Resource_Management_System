package com.wishtree.rmp.dto;

import com.wishtree.rmp.entity.TrainingModule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingModuleDto {

    private Long id;
    private Long trainingId;
    private String title;
    private String description;
    private String materialUrl;
    private String materialType;
    private Integer durationMinutes;
    private Integer orderIndex;
    private Boolean isMandatory;

    // Quiz fields (for QUIZ type modules)
    private Long quizId;
    private String quizTitle;
    private Integer quizTotalQuestions;
    private Integer quizPassingScore;

    // Progress fields (populated when viewing as employee)
    private String progressStatus;
    private String startedAt;
    private String completedAt;
    private Integer timeSpentMinutes;
    private String notes;

    // Quiz progress (for employees)
    private Long quizAssignmentId;
    private Integer quizBestScore;
    private Boolean quizPassed;

    public static TrainingModuleDto fromEntity(TrainingModule module) {
        TrainingModuleDtoBuilder builder = TrainingModuleDto.builder()
                .id(module.getId())
                .trainingId(module.getTraining().getId())
                .title(module.getTitle())
                .description(module.getDescription())
                .materialUrl(module.getMaterialUrl())
                .materialType(module.getMaterialType() != null ? module.getMaterialType().name() : null)
                .durationMinutes(module.getDurationMinutes())
                .orderIndex(module.getOrderIndex())
                .isMandatory(module.getIsMandatory());

        // Include quiz details if this is a quiz module
        if (module.getQuiz() != null) {
            builder.quizId(module.getQuiz().getId())
                    .quizTitle(module.getQuiz().getTitle())
                    .quizTotalQuestions(module.getQuiz().getTotalQuestions())
                    .quizPassingScore(module.getQuiz().getPassingScore());
        }

        return builder.build();
    }
}

