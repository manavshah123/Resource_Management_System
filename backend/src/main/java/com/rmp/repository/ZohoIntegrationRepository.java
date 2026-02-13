package com.rmp.repository;

import com.rmp.entity.ZohoIntegration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ZohoIntegrationRepository extends JpaRepository<ZohoIntegration, Long> {

    @Query("SELECT z FROM ZohoIntegration z WHERE z.status = 'CONNECTED' ORDER BY z.createdAt DESC")
    Optional<ZohoIntegration> findActiveIntegration();

    Optional<ZohoIntegration> findByPortalId(String portalId);

    @Query("SELECT z FROM ZohoIntegration z ORDER BY z.createdAt DESC")
    Optional<ZohoIntegration> findLatestIntegration();
}

