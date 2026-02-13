package com.rmp.repository;

import com.rmp.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {

    List<QuizQuestion> findByQuizIdOrderByOrderIndex(Long quizId);

    long countByQuizId(Long quizId);

    @Query("SELECT q FROM QuizQuestion q LEFT JOIN FETCH q.options WHERE q.quiz.id = :quizId ORDER BY q.orderIndex")
    List<QuizQuestion> findByQuizIdWithOptions(@Param("quizId") Long quizId);

    @Query("SELECT q FROM QuizQuestion q LEFT JOIN FETCH q.options WHERE q.id = :id")
    Optional<QuizQuestion> findByIdWithOptions(@Param("id") Long id);

    @Query("SELECT MAX(q.orderIndex) FROM QuizQuestion q WHERE q.quiz.id = :quizId")
    Integer findMaxOrderIndex(@Param("quizId") Long quizId);
}

