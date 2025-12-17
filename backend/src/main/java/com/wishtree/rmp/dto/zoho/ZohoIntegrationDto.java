package com.wishtree.rmp.dto.zoho;

import com.wishtree.rmp.entity.ZohoIntegration;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZohoIntegrationDto {

    private Long id;
    private String portalId;
    private String portalName;
    private String zohoUserEmail;
    private String zohoUserName;
    private ZohoIntegration.Status status;
    private LocalDateTime lastSync;
    private Boolean syncEnabled;
    private Boolean autoImport;
    private String connectedByName;
    private LocalDateTime connectedAt;
    private boolean tokenExpired;

    public static ZohoIntegrationDto fromEntity(ZohoIntegration entity) {
        if (entity == null) return null;
        
        return ZohoIntegrationDto.builder()
                .id(entity.getId())
                .portalId(entity.getPortalId())
                .portalName(entity.getPortalName())
                .zohoUserEmail(entity.getZohoUserEmail())
                .zohoUserName(entity.getZohoUserName())
                .status(entity.getStatus())
                .lastSync(entity.getLastSync())
                .syncEnabled(entity.getSyncEnabled())
                .autoImport(entity.getAutoImport())
                .connectedByName(entity.getConnectedBy() != null ? entity.getConnectedBy().getName() : null)
                .connectedAt(entity.getCreatedAt())
                .tokenExpired(entity.isTokenExpired())
                .build();
    }
}

