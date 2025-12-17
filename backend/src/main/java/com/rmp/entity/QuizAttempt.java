package com.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_attempts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class QuizAttempt extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private QuizAssignment assignment;

    @Column(nullable = false)
    private Integer attemptNumber;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    private Integer score; // Points scored

    private Integer totalPoints; // Total possible points

    private Integer scorePercentage; // Percentage score

    private Boolean passed;

    private Integer timeSpentSeconds;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<QuizAnswer> answers = new ArrayList<>();

    public enum Status {
        IN_PROGRESS,
        SUBMITTED,
        TIMED_OUT
    }

    public void calculateScore() {
        if (answers == null || answers.isEmpty()) {
            this.score = 0;
            this.scorePercentage = 0;
            return;
        }

        int earnedPoints = answers.stream()
                .filter(QuizAnswer::getIsCorrect)
                .mapToInt(a -> a.getQuestion().getPoints())
                .sum();

        this.score = earnedPoints;
        this.scorePercentage = totalPoints > 0 ? (earnedPoints * 100) / totalPoints : 0;
    }
}

