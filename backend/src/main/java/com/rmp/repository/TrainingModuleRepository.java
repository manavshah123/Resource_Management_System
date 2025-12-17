package com.rmp.repository;

import com.rmp.entity.TrainingModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingModuleRepository extends JpaRepository<TrainingModule, Long> {

    List<TrainingModule> findByTrainingIdOrderByOrderIndexAsc(Long trainingId);

    @Query("SELECT MAX(m.orderIndex) FROM TrainingModule m WHERE m.training.id = :trainingId")
    Integer findMaxOrderIndexByTrainingId(@Param("trainingId") Long trainingId);

    int countByTrainingId(Long trainingId);
}

