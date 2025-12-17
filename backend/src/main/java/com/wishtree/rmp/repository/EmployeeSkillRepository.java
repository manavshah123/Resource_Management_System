package com.wishtree.rmp.repository;

import com.wishtree.rmp.entity.EmployeeSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, Long> {

    List<EmployeeSkill> findByEmployeeId(Long employeeId);

    List<EmployeeSkill> findBySkillId(Long skillId);

    Optional<EmployeeSkill> findByEmployeeIdAndSkillId(Long employeeId, Long skillId);

    boolean existsByEmployeeIdAndSkillId(Long employeeId, Long skillId);

    @Query("SELECT es FROM EmployeeSkill es WHERE es.skill.id = :skillId AND es.level = :level")
    List<EmployeeSkill> findBySkillIdAndLevel(
        @Param("skillId") Long skillId,
        @Param("level") EmployeeSkill.Level level);

    @Query("SELECT es FROM EmployeeSkill es WHERE es.employee.id = :employeeId AND es.primary = true")
    List<EmployeeSkill> findPrimarySkillsByEmployee(@Param("employeeId") Long employeeId);

    void deleteByEmployeeIdAndSkillId(Long employeeId, Long skillId);

    // Count employees with a specific skill by name
    @Query("SELECT COUNT(es) FROM EmployeeSkill es WHERE es.skill.name = :skillName")
    long countBySkillName(@Param("skillName") String skillName);
}

