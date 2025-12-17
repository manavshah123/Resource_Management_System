package com.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "training_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_id", nullable = false)
    private Training training;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "assigned_date", nullable = false)
    private LocalDate assignedDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.NOT_STARTED;

    @Column(name = "progress_percentage")
    @Builder.Default
    private Integer progressPercentage = 0;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(length = 1000)
    private String remarks;

    @Column(name = "employee_notes", length = 1000)
    private String employeeNotes;

    @Column(name = "proof_url")
    private String proofUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by")
    private User assignedBy;

    @Column(name = "skill_added")
    @Builder.Default
    private Boolean skillAdded = false;

    public enum Status {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED,
        OVERDUE,
        CANCELLED
    }

    public void start() {
        this.status = Status.IN_PROGRESS;
        this.startedAt = LocalDateTime.now();
        this.progressPercentage = 0;
    }

    public void updateProgress(int percentage) {
        this.progressPercentage = Math.min(100, Math.max(0, percentage));
        if (this.status == Status.NOT_STARTED && percentage > 0) {
            this.status = Status.IN_PROGRESS;
            this.startedAt = LocalDateTime.now();
        }
    }

    public void complete() {
        this.status = Status.COMPLETED;
        this.progressPercentage = 100;
        this.completedAt = LocalDateTime.now();
    }

    public boolean isOverdue() {
        return dueDate != null && 
               LocalDate.now().isAfter(dueDate) && 
               status != Status.COMPLETED && 
               status != Status.CANCELLED;
    }
}

