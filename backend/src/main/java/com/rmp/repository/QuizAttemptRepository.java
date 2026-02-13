package com.rmp.repository;

import com.rmp.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByAssignmentIdOrderByAttemptNumberDesc(Long assignmentId);

    Optional<QuizAttempt> findByAssignmentIdAndAttemptNumber(Long assignmentId, Integer attemptNumber);

    long countByAssignmentId(Long assignmentId);

    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.assignment.id = :assignmentId AND qa.status = 'IN_PROGRESS'")
    Optional<QuizAttempt> findActiveAttempt(@Param("assignmentId") Long assignmentId);

    @Query("SELECT MAX(qa.scorePercentage) FROM QuizAttempt qa WHERE qa.assignment.id = :assignmentId")
    Integer findBestScoreByAssignmentId(@Param("assignmentId") Long assignmentId);

    @Query("SELECT qa FROM QuizAttempt qa LEFT JOIN FETCH qa.answers WHERE qa.id = :id")
    Optional<QuizAttempt> findByIdWithAnswers(@Param("id") Long id);

    // Find by employee and period
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.assignment.employee.id = :employeeId " +
           "AND qa.startedAt BETWEEN :startDate AND :endDate")
    List<QuizAttempt> findByEmployeeIdAndPeriod(
            @Param("employeeId") Long employeeId,
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate);

    // Get average score in period
    @Query("SELECT COALESCE(AVG(qa.scorePercentage), 0.0) FROM QuizAttempt qa " +
           "WHERE qa.status = 'COMPLETED' AND qa.startedAt BETWEEN :startDate AND :endDate")
    double getAverageScoreInPeriod(
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate);
}

