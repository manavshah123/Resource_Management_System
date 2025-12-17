package com.rmp.service;

import com.rmp.config.ZohoConfig;
import com.rmp.dto.zoho.ZohoTokenResponse;
import com.rmp.entity.ZohoIntegration;
import com.rmp.repository.ZohoIntegrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ZohoOAuthService {

    private final ZohoConfig zohoConfig;
    private final ZohoIntegrationRepository zohoIntegrationRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Generate OAuth authorization URL for Zoho
     */
    public String getAuthorizationUrl() {
        String state = java.util.UUID.randomUUID().toString();
        return zohoConfig.getAuthorizationUrl(state);
    }

    /**
     * Exchange authorization code for access token
     */
    public ZohoTokenResponse exchangeCodeForToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id", zohoConfig.getClientId());
        body.add("client_secret", zohoConfig.getClientSecret());
        body.add("redirect_uri", zohoConfig.getRedirectUri());
        body.add("code", code);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        log.info("Exchanging OAuth code for token at: {}", zohoConfig.getTokenUrl());
        log.debug("Request body: client_id={}, redirect_uri={}, code_length={}", 
            zohoConfig.getClientId(), zohoConfig.getRedirectUri(), code != null ? code.length() : 0);

        try {
            // First, try to get raw response for debugging
            ResponseEntity<String> rawResponse = restTemplate.postForEntity(
                zohoConfig.getTokenUrl(),
                request,
                String.class
            );
            log.info("Zoho token response (raw): {}", rawResponse.getBody());
            
            // Parse the response manually
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ZohoTokenResponse tokenResponse = mapper.readValue(rawResponse.getBody(), ZohoTokenResponse.class);

            if (tokenResponse.hasError()) {
                String errorMsg = tokenResponse.getError() + ": " + 
                    (tokenResponse.getErrorDescription() != null ? tokenResponse.getErrorDescription() : "No description");
                log.error("Zoho OAuth error: {}", errorMsg);
                throw new RuntimeException("Failed to get Zoho access token: " + errorMsg);
            }

            if (tokenResponse.getAccessToken() == null || tokenResponse.getAccessToken().isEmpty()) {
                log.error("No access token in response: {}", rawResponse.getBody());
                throw new RuntimeException("Zoho returned empty access token");
            }

            log.info("Successfully obtained Zoho access token, expires in: {} seconds", tokenResponse.getExpiresIn());
            return tokenResponse;
        } catch (Exception e) {
            log.error("Failed to exchange code for token", e);
            throw new RuntimeException("Failed to authenticate with Zoho: " + e.getMessage());
        }
    }

    /**
     * Refresh expired access token
     */
    public ZohoTokenResponse refreshAccessToken(String refreshToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "refresh_token");
        body.add("client_id", zohoConfig.getClientId());
        body.add("client_secret", zohoConfig.getClientSecret());
        body.add("refresh_token", refreshToken);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<ZohoTokenResponse> response = restTemplate.postForEntity(
                zohoConfig.getTokenUrl(),
                request,
                ZohoTokenResponse.class
            );

            if (response.getBody() != null && response.getBody().hasError()) {
                log.error("Zoho token refresh error: {}", response.getBody().getErrorDescription());
                throw new RuntimeException("Failed to refresh Zoho token: " + response.getBody().getErrorDescription());
            }

            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to refresh access token", e);
            throw new RuntimeException("Failed to refresh Zoho token: " + e.getMessage());
        }
    }

    /**
     * Get a valid access token, refreshing if necessary
     */
    public String getValidAccessToken() {
        Optional<ZohoIntegration> integrationOpt = zohoIntegrationRepository.findActiveIntegration();
        
        if (integrationOpt.isEmpty()) {
            throw new RuntimeException("No active Zoho integration found");
        }

        ZohoIntegration integration = integrationOpt.get();

        if (integration.isTokenExpired()) {
            log.info("Access token expired, refreshing...");
            ZohoTokenResponse newToken = refreshAccessToken(integration.getRefreshToken());
            
            integration.setAccessToken(newToken.getAccessToken());
            integration.setTokenExpiry(LocalDateTime.now().plusSeconds(newToken.getExpiresIn() - 300)); // 5 min buffer
            zohoIntegrationRepository.save(integration);
            
            return newToken.getAccessToken();
        }

        return integration.getAccessToken();
    }

    /**
     * Create HTTP headers with valid access token
     */
    public HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        // Zoho requires "Zoho-oauthtoken" format, not "Bearer"
        headers.set("Authorization", "Zoho-oauthtoken " + getValidAccessToken());
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}

