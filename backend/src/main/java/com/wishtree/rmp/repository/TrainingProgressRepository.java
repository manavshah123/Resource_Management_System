package com.wishtree.rmp.repository;

import com.wishtree.rmp.entity.TrainingProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingProgressRepository extends JpaRepository<TrainingProgress, Long> {

    List<TrainingProgress> findByAssignmentId(Long assignmentId);

    Optional<TrainingProgress> findByAssignmentIdAndModuleId(Long assignmentId, Long moduleId);

    @Query("SELECT COUNT(p) FROM TrainingProgress p WHERE p.assignment.id = :assignmentId AND p.status = 'COMPLETED'")
    int countCompletedByAssignmentId(@Param("assignmentId") Long assignmentId);

    @Query("SELECT p FROM TrainingProgress p WHERE p.assignment.employee.id = :employeeId ORDER BY p.module.orderIndex")
    List<TrainingProgress> findByEmployeeId(@Param("employeeId") Long employeeId);

    void deleteByAssignmentId(Long assignmentId);
}

