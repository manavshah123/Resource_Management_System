package com.wishtree.rmp.dto;

import com.wishtree.rmp.entity.Quiz;
import com.wishtree.rmp.entity.QuizOption;
import com.wishtree.rmp.entity.QuizQuestion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizDto {
    private Long id;
    private String title;
    private String description;
    private String difficulty;
    private String category;
    private Integer passingScore;
    private Integer durationMinutes;
    private Integer maxAttempts;
    private Boolean shuffleQuestions;
    private Boolean showCorrectAnswers;
    private String status;
    private Long trainingId;
    private String trainingTitle;
    private Long authorId;
    private String authorName;
    private Integer totalQuestions;
    private Integer totalPoints;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<QuestionDto> questions;

    // Statistics
    private Long totalAssignments;
    private Long completedAssignments;
    private Double averageScore;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionDto {
        private Long id;
        private String questionText;
        private String type;
        private Integer points;
        private Integer orderIndex;
        private String explanation;
        private String imageUrl;
        private List<OptionDto> options;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionDto {
        private Long id;
        private String optionText;
        private Boolean isCorrect;
        private Integer orderIndex;
        private String explanation;
    }

    public static QuizDto fromEntity(Quiz quiz) {
        return fromEntity(quiz, false);
    }

    public static QuizDto fromEntity(Quiz quiz, boolean includeQuestions) {
        QuizDtoBuilder builder = QuizDto.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .difficulty(quiz.getDifficulty() != null ? quiz.getDifficulty().name() : null)
                .category(quiz.getCategory() != null ? quiz.getCategory().name() : null)
                .passingScore(quiz.getPassingScore())
                .durationMinutes(quiz.getDurationMinutes())
                .maxAttempts(quiz.getMaxAttempts())
                .shuffleQuestions(quiz.getShuffleQuestions())
                .showCorrectAnswers(quiz.getShowCorrectAnswers())
                .status(quiz.getStatus() != null ? quiz.getStatus().name() : null)
                .totalQuestions(quiz.getTotalQuestions())
                .totalPoints(quiz.getTotalPoints())
                .createdAt(quiz.getCreatedAt())
                .updatedAt(quiz.getUpdatedAt());

        if (quiz.getTraining() != null) {
            builder.trainingId(quiz.getTraining().getId())
                    .trainingTitle(quiz.getTraining().getTitle());
        }

        if (quiz.getAuthor() != null) {
            builder.authorId(quiz.getAuthor().getId())
                    .authorName(quiz.getAuthor().getName());
        }

        if (includeQuestions && quiz.getQuestions() != null) {
            builder.questions(quiz.getQuestions().stream()
                    .map(QuizDto::mapQuestion)
                    .toList());
        }

        return builder.build();
    }

    private static QuestionDto mapQuestion(QuizQuestion question) {
        return QuestionDto.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .type(question.getType() != null ? question.getType().name() : null)
                .points(question.getPoints())
                .orderIndex(question.getOrderIndex())
                .explanation(question.getExplanation())
                .imageUrl(question.getImageUrl())
                .options(question.getOptions() != null ? 
                        question.getOptions().stream().map(QuizDto::mapOption).toList() : null)
                .build();
    }

    private static OptionDto mapOption(QuizOption option) {
        return OptionDto.builder()
                .id(option.getId())
                .optionText(option.getOptionText())
                .isCorrect(option.getIsCorrect())
                .orderIndex(option.getOrderIndex())
                .explanation(option.getExplanation())
                .build();
    }
}

