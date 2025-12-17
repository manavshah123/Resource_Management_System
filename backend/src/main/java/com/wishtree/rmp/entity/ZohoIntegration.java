package com.wishtree.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "zoho_integrations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZohoIntegration extends BaseEntity {

    @Column(name = "portal_id")
    private String portalId;

    @Column(name = "portal_name")
    private String portalName;

    @Column(name = "access_token", length = 2000)
    private String accessToken;

    @Column(name = "refresh_token", length = 2000)
    private String refreshToken;

    @Column(name = "token_expiry")
    private LocalDateTime tokenExpiry;

    @Column(name = "zoho_user_email")
    private String zohoUserEmail;

    @Column(name = "zoho_user_name")
    private String zohoUserName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.DISCONNECTED;

    @Column(name = "last_sync")
    private LocalDateTime lastSync;

    @Column(name = "sync_enabled")
    @Builder.Default
    private Boolean syncEnabled = false;

    @Column(name = "auto_import")
    @Builder.Default
    private Boolean autoImport = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connected_by")
    private Employee connectedBy;

    public boolean isTokenExpired() {
        return tokenExpiry == null || LocalDateTime.now().isAfter(tokenExpiry);
    }

    public enum Status {
        CONNECTED,
        DISCONNECTED,
        ERROR,
        EXPIRED
    }
}

