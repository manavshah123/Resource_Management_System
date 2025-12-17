package com.wishtree.rmp.repository;

import com.wishtree.rmp.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    Optional<Employee> findByEmployeeId(String employeeId);

    Optional<Employee> findByEmail(String email);

    boolean existsByEmployeeId(String employeeId);

    boolean existsByEmail(String email);

    List<Employee> findByDepartment(String department);

    List<Employee> findByStatus(Employee.Status status);

    @Query("SELECT DISTINCT e FROM Employee e LEFT JOIN FETCH e.skills")
    List<Employee> findAllWithSkills();

    @Query("SELECT e FROM Employee e WHERE e.status = :status AND e.id NOT IN " +
           "(SELECT DISTINCT a.employee.id FROM Allocation a WHERE a.status = 'ACTIVE')")
    List<Employee> findBenchEmployees(@Param("status") Employee.Status status);

    @Query("SELECT DISTINCT e.department FROM Employee e WHERE e.department IS NOT NULL ORDER BY e.department")
    List<String> findAllDepartments();

    // Find employees with FTE allocation less than threshold (e.g., 0.9 = 90%)
    @Query("SELECT e FROM Employee e LEFT JOIN e.allocations a " +
           "WHERE e.status = 'ACTIVE' AND (a IS NULL OR a.status = 'ACTIVE') " +
           "GROUP BY e HAVING COALESCE(SUM(a.fte), 0) < :maxFTE")
    List<Employee> findAvailableEmployees(@Param("maxFTE") double maxFTE);

    Page<Employee> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
        String name, String email, Pageable pageable);

    List<Employee> findByManagerId(Long managerId);
}

