package com.rmp.repository;

import com.rmp.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    Optional<Certificate> findByCertificateNumber(String certificateNumber);

    Optional<Certificate> findByAssignmentId(Long assignmentId);

    List<Certificate> findByEmployeeId(Long employeeId);

    List<Certificate> findByTrainingId(Long trainingId);

    boolean existsByAssignmentId(Long assignmentId);

    // Count certificates issued in period
    @Query("SELECT COUNT(c) FROM Certificate c WHERE c.issuedDate BETWEEN :startDate AND :endDate")
    long countIssuedInPeriod(
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate);
}

