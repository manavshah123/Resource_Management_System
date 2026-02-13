package com.rmp.repository;

import com.rmp.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {

    Optional<Skill> findByName(String name);

    boolean existsByName(String name);

    List<Skill> findByCategory(String category);

    @Query("SELECT COUNT(s) FROM Skill s WHERE s.category = :category")
    int countByCategory(@Param("category") String category);

    @Query("SELECT s FROM Skill s LEFT JOIN FETCH s.employeeSkills")
    List<Skill> findAllWithEmployees();

    @Query("SELECT s FROM Skill s ORDER BY SIZE(s.employeeSkills) DESC")
    List<Skill> findMostUsedSkills();

    @Query("SELECT DISTINCT s.category FROM Skill s")
    List<String> findAllCategories();

    @Query("SELECT s FROM Skill s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Skill> searchByName(@Param("search") String search);

    // Find trending skills (most demanded in recent projects)
    @Query(value = "SELECT s.name FROM skills s " +
           "INNER JOIN project_skills ps ON s.id = ps.skill_id " +
           "GROUP BY s.id, s.name ORDER BY COUNT(ps.project_id) DESC LIMIT :limit", nativeQuery = true)
    List<String> findTrendingSkills(@Param("limit") int limit);
}
