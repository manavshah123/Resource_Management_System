package com.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Quiz extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Column(nullable = false)
    private Integer passingScore; // Percentage required to pass (e.g., 70)

    @Column(nullable = false)
    private Integer durationMinutes; // Time limit for the quiz

    private Integer maxAttempts; // null = unlimited

    private Boolean shuffleQuestions;

    private Boolean showCorrectAnswers; // Show correct answers after completion

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_id")
    private Training training; // Optional: quiz can be linked to a training

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<QuizQuestion> questions = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User author;

    public enum Difficulty {
        BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    }

    public enum Category {
        TECHNICAL, SOFT_SKILLS, COMPLIANCE, DOMAIN, GENERAL
    }

    public enum Status {
        DRAFT, PUBLISHED, ARCHIVED
    }

    public int getTotalQuestions() {
        return questions != null ? questions.size() : 0;
    }

    public int getTotalPoints() {
        return questions != null ? questions.stream().mapToInt(QuizQuestion::getPoints).sum() : 0;
    }
}

