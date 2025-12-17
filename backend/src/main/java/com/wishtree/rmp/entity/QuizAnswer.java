package com.wishtree.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_answers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class QuizAnswer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    @ManyToMany
    @JoinTable(
            name = "quiz_answer_selected_options",
            joinColumns = @JoinColumn(name = "answer_id"),
            inverseJoinColumns = @JoinColumn(name = "option_id")
    )
    @Builder.Default
    private List<QuizOption> selectedOptions = new ArrayList<>();

    private String textAnswer; // For SHORT_ANSWER type questions

    @Column(nullable = false)
    private Boolean isCorrect;

    private Integer pointsEarned;

    public void evaluateAnswer() {
        if (question == null) return;

        List<QuizOption> correctOptions = question.getCorrectOptions();
        
        if (question.getType() == QuizQuestion.QuestionType.SHORT_ANSWER) {
            // Short answer evaluation would need custom logic or manual grading
            this.isCorrect = false;
            this.pointsEarned = 0;
            return;
        }

        // For choice-based questions
        if (selectedOptions == null || selectedOptions.isEmpty()) {
            this.isCorrect = false;
            this.pointsEarned = 0;
            return;
        }

        // Check if selected options match correct options exactly
        boolean allCorrect = selectedOptions.stream()
                .allMatch(QuizOption::getIsCorrect);
        boolean allSelectedCorrect = selectedOptions.size() == correctOptions.size() && allCorrect;

        this.isCorrect = allSelectedCorrect;
        this.pointsEarned = allSelectedCorrect ? question.getPoints() : 0;
    }
}

