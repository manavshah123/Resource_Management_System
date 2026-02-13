package com.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "training_modules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingModule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_id", nullable = false)
    private Training training;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(name = "material_url")
    private String materialUrl;

    @Column(name = "material_type")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MaterialType materialType = MaterialType.LINK;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "is_mandatory")
    @Builder.Default
    private Boolean isMandatory = true;

    // For QUIZ type modules - link to a quiz
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    public enum MaterialType {
        VIDEO,
        DOCUMENT,
        LINK,
        QUIZ,
        ASSIGNMENT
    }
}

