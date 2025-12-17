package com.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "employee_skill_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeSkill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Level level = Level.BEGINNER;

    @Column(name = "years_of_experience")
    @Builder.Default
    private Integer yearsOfExperience = 0;

    @Column(name = "is_primary")
    @Builder.Default
    private boolean primary = false;

    private String notes;

    public enum Level {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED,
        EXPERT
    }
}

