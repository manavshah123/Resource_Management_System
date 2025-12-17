package com.wishtree.rmp.repository;

import com.wishtree.rmp.entity.Quiz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    Page<Quiz> findByStatus(Quiz.Status status, Pageable pageable);

    List<Quiz> findByStatusOrderByCreatedAtDesc(Quiz.Status status);

    List<Quiz> findByTrainingId(Long trainingId);

    Optional<Quiz> findByTrainingIdAndStatus(Long trainingId, Quiz.Status status);

    @Query("SELECT q FROM Quiz q WHERE q.status = :status AND " +
            "(LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(q.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Quiz> searchQuizzes(@Param("search") String search, @Param("status") Quiz.Status status, Pageable pageable);

    @Query("SELECT q FROM Quiz q WHERE " +
            "(:category IS NULL OR q.category = :category) AND " +
            "(:difficulty IS NULL OR q.difficulty = :difficulty) AND " +
            "q.status = 'PUBLISHED'")
    List<Quiz> findByFilters(@Param("category") Quiz.Category category,
                             @Param("difficulty") Quiz.Difficulty difficulty);

    long countByStatus(Quiz.Status status);

    @Query("SELECT q FROM Quiz q LEFT JOIN FETCH q.questions WHERE q.id = :id")
    Optional<Quiz> findByIdWithQuestions(@Param("id") Long id);
}

