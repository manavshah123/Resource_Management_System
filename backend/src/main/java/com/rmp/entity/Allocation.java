package com.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Allocation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // FTE - Full Time Equivalent (1 FTE = 8 hours/day)
    @Column(name = "fte", nullable = false)
    private Double fte;
    
    // Helper method to get hours per day (1 FTE = 8 hours)
    public Double getHoursPerDay() {
        return fte != null ? fte * 8 : 0;
    }
    
    // Backward compatibility - returns percentage (1 FTE = 100%)
    public Integer getAllocationPercentage() {
        return fte != null ? (int)(fte * 100) : 0;
    }

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    private String role;

    @Column(length = 1000)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(name = "billable")
    @Builder.Default
    private boolean billable = true;

    // Assigned techstack/skills - what technologies this person will work on in this project
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "allocation_assigned_skills",
        joinColumns = @JoinColumn(name = "allocation_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private Set<Skill> assignedSkills = new HashSet<>();

    public boolean isActive() {
        LocalDate now = LocalDate.now();
        return status == Status.ACTIVE &&
               !now.isBefore(startDate) &&
               !now.isAfter(endDate);
    }

    public void addAssignedSkill(Skill skill) {
        this.assignedSkills.add(skill);
    }

    public void removeAssignedSkill(Skill skill) {
        this.assignedSkills.remove(skill);
    }

    public enum Status {
        ACTIVE,
        PENDING,
        COMPLETED,
        CANCELLED
    }
}

