package com.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class QuizQuestion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @Column(nullable = false)
    private Integer points;

    @Column(nullable = false)
    private Integer orderIndex;

    private String explanation; // Explanation shown after answering

    private String imageUrl; // Optional image for the question

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<QuizOption> options = new ArrayList<>();

    public enum QuestionType {
        SINGLE_CHOICE,      // One correct answer
        MULTIPLE_CHOICE,    // Multiple correct answers
        TRUE_FALSE,         // True/False question
        SHORT_ANSWER        // Text input (for future)
    }

    public List<QuizOption> getCorrectOptions() {
        return options.stream()
                .filter(QuizOption::getIsCorrect)
                .toList();
    }
}

