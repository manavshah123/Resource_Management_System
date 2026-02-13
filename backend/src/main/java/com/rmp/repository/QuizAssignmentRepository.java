package com.rmp.repository;

import com.rmp.entity.QuizAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAssignmentRepository extends JpaRepository<QuizAssignment, Long> {

    List<QuizAssignment> findByEmployeeId(Long employeeId);

    List<QuizAssignment> findByQuizId(Long quizId);

    Page<QuizAssignment> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId, Pageable pageable);

    List<QuizAssignment> findByEmployeeIdAndStatus(Long employeeId, QuizAssignment.Status status);

    Optional<QuizAssignment> findByQuizIdAndEmployeeId(Long quizId, Long employeeId);

    @Query("SELECT qa FROM QuizAssignment qa WHERE qa.employee.id = :employeeId AND qa.status IN ('PENDING', 'IN_PROGRESS')")
    List<QuizAssignment> findPendingByEmployeeId(@Param("employeeId") Long employeeId);

    @Query("SELECT qa FROM QuizAssignment qa WHERE qa.dueDate < :date AND qa.status = 'PENDING'")
    List<QuizAssignment> findOverdueAssignments(@Param("date") LocalDate date);

    long countByQuizIdAndStatus(Long quizId, QuizAssignment.Status status);

    long countByQuizIdAndPassed(Long quizId, Boolean passed);

    @Query("SELECT AVG(qa.bestScore) FROM QuizAssignment qa WHERE qa.quiz.id = :quizId AND qa.status = 'COMPLETED'")
    Double findAverageScoreByQuizId(@Param("quizId") Long quizId);

    List<QuizAssignment> findByTrainingAssignmentId(Long trainingAssignmentId);
}

