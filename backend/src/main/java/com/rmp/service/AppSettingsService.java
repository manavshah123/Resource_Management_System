package com.rmp.service;

import com.rmp.dto.AppSettingsDto;
import com.rmp.entity.AppSettings;
import com.rmp.repository.AppSettingsRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppSettingsService {

    private final AppSettingsRepository settingsRepository;

    // Fallback values from environment (for initial setup)
    @Value("${zoho.enabled:false}")
    private boolean zohoEnabledEnv;

    @Value("${zoho.client-id:}")
    private String zohoClientIdEnv;

    @Value("${zoho.client-secret:}")
    private String zohoClientSecretEnv;

    @Value("${zoho.redirect-uri:http://localhost:3000/integrations/zoho/callback}")
    private String zohoRedirectUriEnv;

    @Value("${zoho.auth-url:https://accounts.zoho.com/oauth/v2/auth}")
    private String zohoAuthUrlEnv;

    @Value("${zoho.token-url:https://accounts.zoho.com/oauth/v2/token}")
    private String zohoTokenUrlEnv;

    @Value("${zoho.api-base-url:https://projectsapi.zoho.com/restapi}")
    private String zohoApiBaseUrlEnv;

    @Value("${zoho.people-api-base-url:https://people.zoho.com/people/api/timetracker}")
    private String zohoPeopleApiBaseUrlEnv;

    @Value("${zoho.scopes:ZohoProjects.portals.READ,ZohoProjects.projects.READ}")
    private String zohoScopesEnv;

    @PostConstruct
    public void initializeDefaultSettings() {
        if (settingsRepository.count() == 0) {
            log.info("Initializing default application settings...");
            initializeBrandingSettings();
            initializeZohoSettings();
            initializeGeneralSettings();
            log.info("Default settings initialized");
        }
    }

    private void initializeBrandingSettings() {
        List<AppSettings> brandingSettings = Arrays.asList(
            createSetting(AppSettings.CATEGORY_BRANDING, AppSettings.KEY_APP_NAME, 
                "Resource Management Portal", "Application Name", "The name displayed in the browser tab and header", "STRING", false, true, 1),
            createSetting(AppSettings.CATEGORY_BRANDING, AppSettings.KEY_APP_LOGO, 
                "", "Logo URL", "URL or path to the application logo", "STRING", false, false, 2),
            createSetting(AppSettings.CATEGORY_BRANDING, AppSettings.KEY_APP_FAVICON, 
                "", "Favicon URL", "URL or path to the favicon", "STRING", false, false, 3),
            createSetting(AppSettings.CATEGORY_BRANDING, AppSettings.KEY_THEME_ID, 
                "default", "Theme", "Application color theme", "STRING", false, false, 4),
            createSetting(AppSettings.CATEGORY_BRANDING, AppSettings.KEY_COMPANY_NAME, 
                "RMP", "Company Name", "Your company name", "STRING", false, false, 5),
            createSetting(AppSettings.CATEGORY_BRANDING, AppSettings.KEY_SUPPORT_EMAIL, 
                "support@rmp.com", "Support Email", "Support contact email", "STRING", false, false, 6),
            createSetting(AppSettings.CATEGORY_BRANDING, AppSettings.KEY_COPYRIGHT_TEXT, 
                "© 2024 RMP. All rights reserved.", "Copyright Text", "Footer copyright text", "STRING", false, false, 7)
        );
        settingsRepository.saveAll(brandingSettings);
    }

    private void initializeZohoSettings() {
        List<AppSettings> zohoSettings = Arrays.asList(
            createSetting(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_ENABLED, 
                String.valueOf(zohoEnabledEnv), "Zoho Integration Enabled", "Enable or disable Zoho integration", "BOOLEAN", false, false, 1),
            createSetting(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_CLIENT_ID, 
                zohoClientIdEnv, "Client ID", "Zoho API Console Client ID", "STRING", false, true, 2),
            createSetting(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_CLIENT_SECRET, 
                zohoClientSecretEnv, "Client Secret", "Zoho API Console Client Secret", "SECRET", true, true, 3),
            createSetting(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_REDIRECT_URI, 
                zohoRedirectUriEnv, "Redirect URI", "OAuth callback URL", "STRING", false, true, 4),
            createSetting(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_AUTH_URL, 
                zohoAuthUrlEnv, "Auth URL", "Zoho OAuth authorization URL", "STRING", false, false, 5),
            createSetting(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_TOKEN_URL, 
                zohoTokenUrlEnv, "Token URL", "Zoho OAuth token URL", "STRING", false, false, 6),
            createSetting(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_API_BASE_URL, 
                zohoApiBaseUrlEnv, "API Base URL", "Zoho Projects API base URL", "STRING", false, false, 7),
            createSetting(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_PEOPLE_API_BASE_URL, 
                zohoPeopleApiBaseUrlEnv, "People API Base URL", "Zoho People API base URL", "STRING", false, false, 8),
            createSetting(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_SCOPES, 
                zohoScopesEnv, "OAuth Scopes", "Comma-separated list of OAuth scopes", "STRING", false, false, 9)
        );
        settingsRepository.saveAll(zohoSettings);
    }

    private void initializeGeneralSettings() {
        List<AppSettings> generalSettings = Arrays.asList(
            createSetting(AppSettings.CATEGORY_GENERAL, "SESSION_TIMEOUT", 
                "30", "Session Timeout (minutes)", "User session timeout in minutes", "NUMBER", false, false, 1),
            createSetting(AppSettings.CATEGORY_GENERAL, "DEFAULT_PAGE_SIZE", 
                "10", "Default Page Size", "Default number of items per page", "NUMBER", false, false, 2),
            createSetting(AppSettings.CATEGORY_GENERAL, "DATE_FORMAT", 
                "yyyy-MM-dd", "Date Format", "Default date format", "STRING", false, false, 3),
            createSetting(AppSettings.CATEGORY_GENERAL, "TIME_ZONE", 
                "UTC", "Time Zone", "Default time zone", "STRING", false, false, 4)
        );
        settingsRepository.saveAll(generalSettings);
    }

    private AppSettings createSetting(String category, String key, String value, 
            String displayName, String description, String valueType, boolean isSecret, boolean isRequired, int order) {
        return AppSettings.builder()
                .category(category)
                .key(key)
                .value(value)
                .displayName(displayName)
                .description(description)
                .valueType(valueType)
                .isSecret(isSecret)
                .isRequired(isRequired)
                .displayOrder(order)
                .build();
    }

    // ========================================
    // READ OPERATIONS
    // ========================================

    public AppSettingsDto.AllSettings getAllSettings() {
        List<AppSettings> allSettings = settingsRepository.findAllByOrderByCategoryAscDisplayOrderAsc();
        
        Map<String, List<AppSettings>> grouped = allSettings.stream()
                .collect(Collectors.groupingBy(AppSettings::getCategory, LinkedHashMap::new, Collectors.toList()));
        
        List<AppSettingsDto.CategorySettings> categories = grouped.entrySet().stream()
                .map(entry -> AppSettingsDto.CategorySettings.builder()
                        .category(entry.getKey())
                        .categoryDisplayName(getCategoryDisplayName(entry.getKey()))
                        .settings(entry.getValue().stream()
                                .map(AppSettingsDto::fromEntity)
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
        
        return AppSettingsDto.AllSettings.builder()
                .categories(categories)
                .build();
    }

    public List<AppSettingsDto> getSettingsByCategory(String category) {
        return settingsRepository.findByCategoryOrderByDisplayOrder(category).stream()
                .map(AppSettingsDto::fromEntity)
                .collect(Collectors.toList());
    }

    public String getValue(String category, String key) {
        return settingsRepository.findValueByCategoryAndKey(category, key).orElse(null);
    }

    public String getValue(String category, String key, String defaultValue) {
        return settingsRepository.findValueByCategoryAndKey(category, key).orElse(defaultValue);
    }

    public boolean getBooleanValue(String category, String key, boolean defaultValue) {
        String value = getValue(category, key);
        return value != null ? Boolean.parseBoolean(value) : defaultValue;
    }

    public int getIntValue(String category, String key, int defaultValue) {
        String value = getValue(category, key);
        try {
            return value != null ? Integer.parseInt(value) : defaultValue;
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    // ========================================
    // BRANDING CONFIGURATION
    // ========================================

    @Cacheable(value = "branding", key = "'config'")
    public AppSettingsDto.BrandingConfig getBrandingConfig() {
        List<AppSettings> settings = settingsRepository.findByCategory(AppSettings.CATEGORY_BRANDING);
        Map<String, String> map = settings.stream()
                .collect(Collectors.toMap(AppSettings::getKey, s -> s.getValue() != null ? s.getValue() : ""));
        
        return AppSettingsDto.BrandingConfig.builder()
                .appName(map.getOrDefault(AppSettings.KEY_APP_NAME, "Resource Management Portal"))
                .appLogo(map.getOrDefault(AppSettings.KEY_APP_LOGO, ""))
                .appFavicon(map.getOrDefault(AppSettings.KEY_APP_FAVICON, ""))
                .themeId(map.getOrDefault(AppSettings.KEY_THEME_ID, "default"))
                .companyName(map.getOrDefault(AppSettings.KEY_COMPANY_NAME, "RMP"))
                .supportEmail(map.getOrDefault(AppSettings.KEY_SUPPORT_EMAIL, "support@rmp.com"))
                .copyrightText(map.getOrDefault(AppSettings.KEY_COPYRIGHT_TEXT, "© 2024 RMP. All rights reserved."))
                .build();
    }

    // ========================================
    // ZOHO CONFIGURATION
    // ========================================

    @Cacheable(value = "zoho", key = "'config'")
    public AppSettingsDto.ZohoConfig getZohoConfig() {
        List<AppSettings> settings = settingsRepository.findByCategory(AppSettings.CATEGORY_ZOHO);
        Map<String, String> map = settings.stream()
                .collect(Collectors.toMap(AppSettings::getKey, s -> s.getValue() != null ? s.getValue() : ""));
        
        return AppSettingsDto.ZohoConfig.builder()
                .enabled(Boolean.parseBoolean(map.getOrDefault(AppSettings.KEY_ZOHO_ENABLED, "false")))
                .clientId(map.getOrDefault(AppSettings.KEY_ZOHO_CLIENT_ID, ""))
                .clientSecret(map.getOrDefault(AppSettings.KEY_ZOHO_CLIENT_SECRET, ""))
                .redirectUri(map.getOrDefault(AppSettings.KEY_ZOHO_REDIRECT_URI, "http://localhost:3000/integrations/zoho/callback"))
                .authUrl(map.getOrDefault(AppSettings.KEY_ZOHO_AUTH_URL, "https://accounts.zoho.com/oauth/v2/auth"))
                .tokenUrl(map.getOrDefault(AppSettings.KEY_ZOHO_TOKEN_URL, "https://accounts.zoho.com/oauth/v2/token"))
                .apiBaseUrl(map.getOrDefault(AppSettings.KEY_ZOHO_API_BASE_URL, "https://projectsapi.zoho.com/restapi"))
                .peopleApiBaseUrl(map.getOrDefault(AppSettings.KEY_ZOHO_PEOPLE_API_BASE_URL, "https://people.zoho.com/people/api/timetracker"))
                .scopes(map.getOrDefault(AppSettings.KEY_ZOHO_SCOPES, "ZohoProjects.portals.READ,ZohoProjects.projects.READ"))
                .build();
    }

    // ========================================
    // UPDATE OPERATIONS
    // ========================================

    @Transactional
    @CacheEvict(value = {"branding", "zoho"}, allEntries = true)
    public AppSettingsDto updateSetting(String category, String key, String value) {
        AppSettings setting = settingsRepository.findByCategoryAndKey(category, key)
                .orElseThrow(() -> new RuntimeException("Setting not found: " + category + "." + key));
        
        setting.setValue(value);
        AppSettings saved = settingsRepository.save(setting);
        log.info("Updated setting: {}.{}", category, key);
        return AppSettingsDto.fromEntity(saved);
    }

    @Transactional
    @CacheEvict(value = {"branding", "zoho"}, allEntries = true)
    public void updateSettings(List<AppSettingsDto.UpdateSettingRequest> updates) {
        for (AppSettingsDto.UpdateSettingRequest update : updates) {
            settingsRepository.findByCategoryAndKey(update.getCategory(), update.getKey())
                    .ifPresent(setting -> {
                        setting.setValue(update.getValue());
                        settingsRepository.save(setting);
                        log.info("Updated setting: {}.{}", update.getCategory(), update.getKey());
                    });
        }
    }

    @Transactional
    @CacheEvict(value = "branding", allEntries = true)
    public AppSettingsDto.BrandingConfig updateBrandingConfig(AppSettingsDto.BrandingConfig config) {
        updateSettingValue(AppSettings.CATEGORY_BRANDING, AppSettings.KEY_APP_NAME, config.getAppName());
        updateSettingValue(AppSettings.CATEGORY_BRANDING, AppSettings.KEY_APP_LOGO, config.getAppLogo());
        updateSettingValue(AppSettings.CATEGORY_BRANDING, AppSettings.KEY_APP_FAVICON, config.getAppFavicon());
        updateSettingValue(AppSettings.CATEGORY_BRANDING, AppSettings.KEY_THEME_ID, config.getThemeId());
        updateSettingValue(AppSettings.CATEGORY_BRANDING, AppSettings.KEY_COMPANY_NAME, config.getCompanyName());
        updateSettingValue(AppSettings.CATEGORY_BRANDING, AppSettings.KEY_SUPPORT_EMAIL, config.getSupportEmail());
        updateSettingValue(AppSettings.CATEGORY_BRANDING, AppSettings.KEY_COPYRIGHT_TEXT, config.getCopyrightText());
        
        log.info("Updated branding configuration");
        return getBrandingConfig();
    }

    @Transactional
    @CacheEvict(value = "zoho", allEntries = true)
    public AppSettingsDto.ZohoConfig updateZohoConfig(AppSettingsDto.ZohoConfig config) {
        updateSettingValue(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_ENABLED, String.valueOf(config.getEnabled()));
        updateSettingValue(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_CLIENT_ID, config.getClientId());
        if (config.getClientSecret() != null && !config.getClientSecret().equals("********")) {
            updateSettingValue(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_CLIENT_SECRET, config.getClientSecret());
        }
        updateSettingValue(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_REDIRECT_URI, config.getRedirectUri());
        updateSettingValue(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_AUTH_URL, config.getAuthUrl());
        updateSettingValue(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_TOKEN_URL, config.getTokenUrl());
        updateSettingValue(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_API_BASE_URL, config.getApiBaseUrl());
        updateSettingValue(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_PEOPLE_API_BASE_URL, config.getPeopleApiBaseUrl());
        updateSettingValue(AppSettings.CATEGORY_ZOHO, AppSettings.KEY_ZOHO_SCOPES, config.getScopes());
        
        log.info("Updated Zoho configuration");
        return getZohoConfig();
    }

    private void updateSettingValue(String category, String key, String value) {
        settingsRepository.findByCategoryAndKey(category, key)
                .ifPresentOrElse(
                    setting -> {
                        setting.setValue(value);
                        settingsRepository.save(setting);
                    },
                    () -> {
                        // Create the setting if it doesn't exist
                        AppSettings newSetting = AppSettings.builder()
                                .category(category)
                                .key(key)
                                .value(value)
                                .displayName(key.replace("_", " ").toLowerCase())
                                .valueType("STRING")
                                .isSecret(false)
                                .isRequired(false)
                                .displayOrder(99)
                                .build();
                        settingsRepository.save(newSetting);
                    }
                );
    }

    private String getCategoryDisplayName(String category) {
        return switch (category) {
            case AppSettings.CATEGORY_BRANDING -> "Branding & Appearance";
            case AppSettings.CATEGORY_ZOHO -> "Zoho Integration";
            case AppSettings.CATEGORY_EMAIL -> "Email Configuration";
            case AppSettings.CATEGORY_GENERAL -> "General Settings";
            case AppSettings.CATEGORY_SECURITY -> "Security Settings";
            default -> category;
        };
    }
}

