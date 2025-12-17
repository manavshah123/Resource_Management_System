package com.rmp.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "zoho")
public class ZohoConfig {

    private Boolean enabled = false;
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String authUrl;
    private String tokenUrl;
    private String apiBaseUrl;
    private String scopes;

    public String getAuthorizationUrl(String state) {
        return String.format(
            "%s?scope=%s&client_id=%s&response_type=code&access_type=offline&redirect_uri=%s&state=%s&prompt=consent",
            authUrl,
            scopes,
            clientId,
            redirectUri,
            state
        );
    }
}

