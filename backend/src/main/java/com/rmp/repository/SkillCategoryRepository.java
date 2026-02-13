package com.rmp.repository;

import com.rmp.entity.SkillCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillCategoryRepository extends JpaRepository<SkillCategory, Long> {

    Optional<SkillCategory> findByCode(String code);

    Optional<SkillCategory> findByName(String name);

    boolean existsByCode(String code);

    boolean existsByName(String name);

    @Query("SELECT sc FROM SkillCategory sc WHERE sc.isActive = true ORDER BY sc.displayOrder ASC, sc.name ASC")
    List<SkillCategory> findAllActive();

    @Query("SELECT sc FROM SkillCategory sc ORDER BY sc.displayOrder ASC, sc.name ASC")
    List<SkillCategory> findAllOrdered();
}

