package com.wishtree.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quiz_options")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class QuizOption extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String optionText;

    @Column(nullable = false)
    private Boolean isCorrect;

    @Column(nullable = false)
    private Integer orderIndex;

    private String explanation; // Why this option is correct/incorrect
}

