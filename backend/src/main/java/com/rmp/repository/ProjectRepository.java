package com.rmp.repository;

import com.rmp.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {

    List<Project> findByStatus(Project.Status status);

    List<Project> findByManagerId(Long managerId);

    @Query("SELECT p FROM Project p WHERE p.endDate BETWEEN :startDate AND :endDate")
    List<Project> findProjectsEndingBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    @Query("SELECT p FROM Project p WHERE p.status IN ('NOT_STARTED', 'IN_PROGRESS')")
    List<Project> findActiveProjects();

    @Query("SELECT COUNT(p) FROM Project p WHERE p.status = :status")
    long countByStatus(@Param("status") Project.Status status);

    Page<Project> findByNameContainingIgnoreCaseOrClientContainingIgnoreCase(
        String name, String client, Pageable pageable);

    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.requiredSkills WHERE p.id = :id")
    Project findByIdWithSkills(@Param("id") Long id);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.requiredSkills")
    List<Project> findAllWithSkills();

    @Query(value = "SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.requiredSkills",
           countQuery = "SELECT COUNT(p) FROM Project p")
    Page<Project> findAllWithSkills(Pageable pageable);

    // Find upcoming projects
    @Query("SELECT p FROM Project p WHERE p.status IN ('NOT_STARTED', 'IN_PROGRESS') AND p.startDate BETWEEN :startDate AND :endDate")
    List<Project> findUpcomingProjects(@Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);

    // Count projects requiring a skill (using native query for ManyToMany)
    @Query(value = "SELECT COUNT(DISTINCT project_id) FROM project_required_skills WHERE skill_id = :skillId", nativeQuery = true)
    int countByRequiredSkill(@Param("skillId") Long skillId);
}

