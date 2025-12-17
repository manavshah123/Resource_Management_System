package com.rmp.repository;

import com.rmp.entity.TrainingAssignment;
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
public interface TrainingAssignmentRepository extends JpaRepository<TrainingAssignment, Long> {

    List<TrainingAssignment> findByEmployeeId(Long employeeId);

    List<TrainingAssignment> findByTrainingId(Long trainingId);

    Page<TrainingAssignment> findByEmployeeId(Long employeeId, Pageable pageable);

    Page<TrainingAssignment> findByStatus(TrainingAssignment.Status status, Pageable pageable);

    Optional<TrainingAssignment> findByTrainingIdAndEmployeeId(Long trainingId, Long employeeId);

    @Query("SELECT ta FROM TrainingAssignment ta WHERE ta.employee.id = :employeeId AND ta.status = :status")
    List<TrainingAssignment> findByEmployeeIdAndStatus(
            @Param("employeeId") Long employeeId,
            @Param("status") TrainingAssignment.Status status);

    @Query("SELECT ta FROM TrainingAssignment ta WHERE ta.dueDate < :date AND ta.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<TrainingAssignment> findOverdueAssignments(@Param("date") LocalDate date);

    @Query("SELECT ta FROM TrainingAssignment ta WHERE ta.employee.id = :employeeId AND ta.dueDate BETWEEN :startDate AND :endDate")
    List<TrainingAssignment> findByEmployeeIdAndDueDateBetween(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(ta) FROM TrainingAssignment ta WHERE ta.status = :status")
    long countByStatus(@Param("status") TrainingAssignment.Status status);

    @Query("SELECT ta.status, COUNT(ta) FROM TrainingAssignment ta GROUP BY ta.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT ta FROM TrainingAssignment ta WHERE ta.status = 'COMPLETED' AND ta.skillAdded = false")
    List<TrainingAssignment> findCompletedWithoutSkillAdded();

    @Query("SELECT AVG(ta.progressPercentage) FROM TrainingAssignment ta WHERE ta.training.id = :trainingId")
    Double getAverageProgressByTraining(@Param("trainingId") Long trainingId);

    @Query("SELECT COUNT(ta) FROM TrainingAssignment ta WHERE ta.training.id = :trainingId AND ta.status = 'COMPLETED'")
    long countCompletedByTraining(@Param("trainingId") Long trainingId);

    @Query("SELECT COUNT(ta) FROM TrainingAssignment ta WHERE ta.training.id = :trainingId")
    long countTotalByTraining(@Param("trainingId") Long trainingId);

    List<TrainingAssignment> findByEmployeeIdIn(List<Long> employeeIds);

    // Count completed today
    @Query("SELECT COUNT(ta) FROM TrainingAssignment ta WHERE ta.status = 'COMPLETED' AND CAST(ta.completedAt AS LocalDate) = :date")
    long countCompletedToday(@Param("date") LocalDate date);

    // Count completed in period
    @Query("SELECT COUNT(ta) FROM TrainingAssignment ta WHERE ta.status = 'COMPLETED' " +
           "AND CAST(ta.completedAt AS LocalDate) BETWEEN :startDate AND :endDate")
    long countCompletedInPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}

