package com.rmp.repository;

import com.rmp.entity.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Long>, JpaSpecificationExecutor<Allocation> {

    List<Allocation> findByEmployeeId(Long employeeId);

    List<Allocation> findByProjectId(Long projectId);

    List<Allocation> findByStatus(Allocation.Status status);

    @Query("SELECT a FROM Allocation a WHERE a.employee.id = :employeeId AND a.status = 'ACTIVE'")
    List<Allocation> findActiveAllocationsByEmployee(@Param("employeeId") Long employeeId);

    @Query("SELECT a FROM Allocation a WHERE a.project.id = :projectId AND a.status = 'ACTIVE'")
    List<Allocation> findActiveAllocationsByProject(@Param("projectId") Long projectId);

    @Query("SELECT a FROM Allocation a WHERE a.endDate BETWEEN :startDate AND :endDate AND a.status = 'ACTIVE'")
    List<Allocation> findAllocationsEndingBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Get total FTE for an employee in a given period
    @Query("SELECT COALESCE(SUM(a.fte), 0.0) FROM Allocation a " +
           "WHERE a.employee.id = :employeeId AND a.status = 'ACTIVE' " +
           "AND a.startDate <= :endDate AND a.endDate >= :startDate")
    Double getEmployeeFTEForPeriod(
        @Param("employeeId") Long employeeId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Backward compatibility - returns percentage (FTE * 100)
    @Query("SELECT COALESCE(SUM(a.fte * 100), 0) FROM Allocation a " +
           "WHERE a.employee.id = :employeeId AND a.status = 'ACTIVE' " +
           "AND a.startDate <= :endDate AND a.endDate >= :startDate")
    Integer getEmployeeAllocationForPeriod(
        @Param("employeeId") Long employeeId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM Allocation a WHERE a.employee.id = :employeeId " +
           "AND a.status = 'ACTIVE' AND a.startDate <= :endDate AND a.endDate >= :startDate")
    List<Allocation> findOverlappingAllocations(
        @Param("employeeId") Long employeeId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Find employees with FTE > 1.0 (over-allocated)
    @Query(value = "SELECT a.employee_id, SUM(a.fte) FROM allocations a " +
           "WHERE a.status = 'ACTIVE' GROUP BY a.employee_id HAVING SUM(a.fte) > 1.0", nativeQuery = true)
    List<Object[]> findOverallocatedEmployees();
    
    // Get total FTE for all active allocations of an employee
    @Query("SELECT COALESCE(SUM(a.fte), 0.0) FROM Allocation a " +
           "WHERE a.employee.id = :employeeId AND a.status = 'ACTIVE'")
    Double getEmployeeTotalFTE(@Param("employeeId") Long employeeId);

    // Count unique employees with active allocations
    @Query("SELECT COUNT(DISTINCT a.employee.id) FROM Allocation a WHERE a.status = 'ACTIVE'")
    Long countUniqueAllocatedEmployees();

    // Count total active allocations
    @Query("SELECT COUNT(a) FROM Allocation a WHERE a.status = 'ACTIVE'")
    Long countActiveAllocations();

    // Get average FTE utilization across all active allocations
    @Query("SELECT COALESCE(AVG(a.fte), 0.0) FROM Allocation a WHERE a.status = 'ACTIVE'")
    Double getAverageUtilization();

    // Find allocations by employee active in a period
    @Query("SELECT a FROM Allocation a WHERE a.employee.id = :employeeId " +
           "AND a.startDate <= :endDate AND (a.endDate IS NULL OR a.endDate >= :startDate)")
    List<Allocation> findByEmployeeAndActiveInPeriod(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Find last allocation end date for an employee
    @Query("SELECT MAX(a.endDate) FROM Allocation a WHERE a.employee.id = :employeeId")
    java.util.Optional<LocalDate> findLastAllocationEndDateByEmployee(@Param("employeeId") Long employeeId);

    // Find all active allocations for a date
    @Query("SELECT a FROM Allocation a WHERE a.status = 'ACTIVE' AND a.startDate <= :date AND (a.endDate IS NULL OR a.endDate >= :date)")
    List<Allocation> findActiveAllocations(@Param("date") LocalDate date);
}

