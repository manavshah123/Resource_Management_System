package com.wishtree.rmp.dto;

import com.wishtree.rmp.entity.QuizAssignment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAssignmentDto {
    private Long id;
    private Long quizId;
    private String quizTitle;
    private String quizCategory;
    private String quizDifficulty;
    private Integer quizDuration;
    private Integer passingScore;
    private Long employeeId;
    private String employeeName;
    private Long trainingAssignmentId;
    private Long assignedById;
    private String assignedByName;
    private LocalDate dueDate;
    private String status;
    private String remarks;
    private Integer attemptsUsed;
    private Integer maxAttempts;
    private Integer bestScore;
    private LocalDateTime completedAt;
    private Boolean passed;
    private LocalDateTime createdAt;
    
    // Additional info
    private Integer totalQuestions;

    public static QuizAssignmentDto fromEntity(QuizAssignment assignment) {
        QuizAssignmentDtoBuilder builder = QuizAssignmentDto.builder()
                .id(assignment.getId())
                .dueDate(assignment.getDueDate())
                .status(assignment.getStatus() != null ? assignment.getStatus().name() : null)
                .remarks(assignment.getRemarks())
                .attemptsUsed(assignment.getAttemptsUsed())
                .bestScore(assignment.getBestScore())
                .completedAt(assignment.getCompletedAt())
                .passed(assignment.getPassed())
                .createdAt(assignment.getCreatedAt());

        if (assignment.getQuiz() != null) {
            builder.quizId(assignment.getQuiz().getId())
                    .quizTitle(assignment.getQuiz().getTitle())
                    .quizCategory(assignment.getQuiz().getCategory() != null ? 
                            assignment.getQuiz().getCategory().name() : null)
                    .quizDifficulty(assignment.getQuiz().getDifficulty() != null ? 
                            assignment.getQuiz().getDifficulty().name() : null)
                    .quizDuration(assignment.getQuiz().getDurationMinutes())
                    .passingScore(assignment.getQuiz().getPassingScore())
                    .maxAttempts(assignment.getQuiz().getMaxAttempts())
                    .totalQuestions(assignment.getQuiz().getTotalQuestions());
        }

        if (assignment.getEmployee() != null) {
            builder.employeeId(assignment.getEmployee().getId())
                    .employeeName(assignment.getEmployee().getName());
        }

        if (assignment.getAssignedBy() != null) {
            builder.assignedById(assignment.getAssignedBy().getId())
                    .assignedByName(assignment.getAssignedBy().getName());
        }

        if (assignment.getTrainingAssignment() != null) {
            builder.trainingAssignmentId(assignment.getTrainingAssignment().getId());
        }

        return builder.build();
    }
}

