package com.rmp.repository;

import com.rmp.entity.AppSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppSettingsRepository extends JpaRepository<AppSettings, Long> {

    Optional<AppSettings> findByCategoryAndKey(String category, String key);

    List<AppSettings> findByCategoryOrderByDisplayOrder(String category);

    List<AppSettings> findAllByOrderByCategoryAscDisplayOrderAsc();

    @Query("SELECT s FROM AppSettings s WHERE s.category = :category")
    List<AppSettings> findByCategory(@Param("category") String category);

    @Modifying
    @Query("UPDATE AppSettings s SET s.value = :value WHERE s.category = :category AND s.key = :key")
    int updateValue(@Param("category") String category, @Param("key") String key, @Param("value") String value);

    boolean existsByCategoryAndKey(String category, String key);

    @Query("SELECT s.value FROM AppSettings s WHERE s.category = :category AND s.key = :key")
    Optional<String> findValueByCategoryAndKey(@Param("category") String category, @Param("key") String key);
}

