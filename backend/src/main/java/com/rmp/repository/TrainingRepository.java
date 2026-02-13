package com.rmp.repository;

import com.rmp.entity.Training;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingRepository extends JpaRepository<Training, Long> {

    Page<Training> findByStatus(Training.Status status, Pageable pageable);

    Page<Training> findByCategory(Training.Category category, Pageable pageable);

    Page<Training> findByDifficulty(Training.Difficulty difficulty, Pageable pageable);

    @Query("SELECT t FROM Training t WHERE " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Training> searchTrainings(@Param("search") String search, Pageable pageable);

    @Query("SELECT t FROM Training t JOIN t.relatedSkills s WHERE s.id = :skillId")
    List<Training> findBySkillId(@Param("skillId") Long skillId);

    @Query("SELECT t FROM Training t WHERE t.status = 'ACTIVE' ORDER BY t.createdAt DESC")
    List<Training> findActiveTrainings();

    @Query("SELECT COUNT(t) FROM Training t WHERE t.status = :status")
    long countByStatus(@Param("status") Training.Status status);

    @Query("SELECT t.category, COUNT(t) FROM Training t GROUP BY t.category")
    List<Object[]> countByCategory();
}

