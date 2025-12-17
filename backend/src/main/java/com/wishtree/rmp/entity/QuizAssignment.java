package com.wishtree.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_assignments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class QuizAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_assignment_id")
    private TrainingAssignment trainingAssignment; // Optional: linked to training

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_id")
    private User assignedBy;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    private String remarks;

    private Integer attemptsUsed;

    private Integer bestScore; // Best score achieved (percentage)

    private LocalDateTime completedAt;

    private Boolean passed; // Whether the employee passed the quiz

    public enum Status {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        FAILED,
        EXPIRED
    }

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = Status.PENDING;
        }
        if (attemptsUsed == null) {
            attemptsUsed = 0;
        }
    }
}

