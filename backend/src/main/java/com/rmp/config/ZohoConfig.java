package com.rmp.config;

import com.rmp.dto.AppSettingsDto;
import com.rmp.service.AppSettingsService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

/**
 * Zoho configuration that reads from database settings.
 * Falls back to environment variables if database settings are not available.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ZohoConfig {

    private final AppSettingsService settingsService;

    // Fallback configuration from environment (loaded at startup)
    private final ZohoEnvConfig envConfig;

    /**
     * Get Zoho configuration from database, with fallback to environment variables.
     */
    private AppSettingsDto.ZohoConfig getConfig() {
        try {
            return settingsService.getZohoConfig();
        } catch (Exception e) {
            log.warn("Failed to load Zoho config from database, using environment fallback: {}", e.getMessage());
            return AppSettingsDto.ZohoConfig.builder()
                    .enabled(envConfig.getEnabled() != null ? envConfig.getEnabled() : false)
                    .clientId(envConfig.getClientId())
                    .clientSecret(envConfig.getClientSecret())
                    .redirectUri(envConfig.getRedirectUri())
                    .authUrl(envConfig.getAuthUrl())
                    .tokenUrl(envConfig.getTokenUrl())
                    .apiBaseUrl(envConfig.getApiBaseUrl())
                    .peopleApiBaseUrl(envConfig.getPeopleApiBaseUrl())
                    .scopes(envConfig.getScopes())
                    .build();
        }
    }

    public Boolean getEnabled() {
        return getConfig().getEnabled();
    }

    public String getClientId() {
        return getConfig().getClientId();
    }

    public String getClientSecret() {
        return getConfig().getClientSecret();
    }

    public String getRedirectUri() {
        return getConfig().getRedirectUri();
    }

    public String getAuthUrl() {
        return getConfig().getAuthUrl();
    }

    public String getTokenUrl() {
        return getConfig().getTokenUrl();
    }

    public String getApiBaseUrl() {
        return getConfig().getApiBaseUrl();
    }

    public String getPeopleApiBaseUrl() {
        return getConfig().getPeopleApiBaseUrl();
    }

    public String getScopes() {
        return getConfig().getScopes();
    }

    public String getAuthorizationUrl(String state) {
        AppSettingsDto.ZohoConfig config = getConfig();
        return String.format(
            "%s?scope=%s&client_id=%s&response_type=code&access_type=offline&redirect_uri=%s&state=%s&prompt=consent",
            config.getAuthUrl(),
            config.getScopes(),
            config.getClientId(),
            config.getRedirectUri(),
            state
        );
    }

    /**
     * Inner class to hold environment-based configuration as fallback.
     * This is used during initial startup before database is ready.
     */
    @Data
    @Configuration
    @ConfigurationProperties(prefix = "zoho")
    public static class ZohoEnvConfig {
        private Boolean enabled = false;
        private String clientId;
        private String clientSecret;
        private String redirectUri = "http://localhost:3000/integrations/zoho/callback";
        private String authUrl = "https://accounts.zoho.com/oauth/v2/auth";
        private String tokenUrl = "https://accounts.zoho.com/oauth/v2/token";
        private String apiBaseUrl = "https://projectsapi.zoho.com/restapi";
        private String peopleApiBaseUrl = "https://people.zoho.com/people/api/timetracker";
        private String scopes = "ZohoProjects.portals.READ,ZohoProjects.projects.READ";
    }
}
