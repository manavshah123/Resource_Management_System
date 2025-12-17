package com.wishtree.rmp.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizCreateDto {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Difficulty is required")
    private String difficulty;

    @NotNull(message = "Category is required")
    private String category;

    @NotNull(message = "Passing score is required")
    @Min(value = 0, message = "Passing score must be at least 0")
    @Max(value = 100, message = "Passing score cannot exceed 100")
    private Integer passingScore;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    private Integer maxAttempts;

    private Boolean shuffleQuestions;

    private Boolean showCorrectAnswers;

    private Long trainingId;

    private List<QuestionCreateDto> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionCreateDto {
        private Long id; // For updates

        @NotBlank(message = "Question text is required")
        private String questionText;

        @NotNull(message = "Question type is required")
        private String type;

        @NotNull(message = "Points is required")
        @Min(value = 1, message = "Points must be at least 1")
        private Integer points;

        private Integer orderIndex;

        private String explanation;

        private String imageUrl;

        private List<OptionCreateDto> options;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionCreateDto {
        private Long id; // For updates

        @NotBlank(message = "Option text is required")
        private String optionText;

        @NotNull(message = "isCorrect is required")
        private Boolean isCorrect;

        private Integer orderIndex;

        private String explanation;
    }
}

