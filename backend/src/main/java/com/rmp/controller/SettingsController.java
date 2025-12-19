package com.rmp.controller;

import com.rmp.dto.AppSettingsDto;
import com.rmp.service.AppSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Application Settings", description = "APIs for managing application settings, branding, and integrations")
public class SettingsController {

    private final AppSettingsService settingsService;

    // ========================================
    // PUBLIC ENDPOINTS (No Auth Required)
    // ========================================

    @GetMapping("/public/branding")
    @Operation(summary = "Get branding configuration", description = "Returns public branding settings (no auth required)")
    public ResponseEntity<AppSettingsDto.BrandingConfig> getPublicBranding() {
        return ResponseEntity.ok(settingsService.getBrandingConfig());
    }

    // ========================================
    // AUTHENTICATED ENDPOINTS
    // ========================================

    @GetMapping
    @Operation(summary = "Get all settings", description = "Returns all application settings grouped by category")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppSettingsDto.AllSettings> getAllSettings() {
        return ResponseEntity.ok(settingsService.getAllSettings());
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get settings by category", description = "Returns all settings for a specific category")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppSettingsDto>> getSettingsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(settingsService.getSettingsByCategory(category));
    }

    // ========================================
    // BRANDING ENDPOINTS
    // ========================================

    @GetMapping("/branding")
    @Operation(summary = "Get branding configuration", description = "Returns branding/white-label settings")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<AppSettingsDto.BrandingConfig> getBrandingConfig() {
        return ResponseEntity.ok(settingsService.getBrandingConfig());
    }

    @PutMapping("/branding")
    @Operation(summary = "Update branding configuration", description = "Updates branding/white-label settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppSettingsDto.BrandingConfig> updateBrandingConfig(
            @RequestBody AppSettingsDto.BrandingConfig config) {
        return ResponseEntity.ok(settingsService.updateBrandingConfig(config));
    }

    // ========================================
    // ZOHO INTEGRATION ENDPOINTS
    // ========================================

    @GetMapping("/zoho")
    @Operation(summary = "Get Zoho configuration", description = "Returns Zoho integration settings")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    public ResponseEntity<AppSettingsDto.ZohoConfig> getZohoConfig() {
        AppSettingsDto.ZohoConfig config = settingsService.getZohoConfig();
        // Mask the client secret for security
        if (config.getClientSecret() != null && !config.getClientSecret().isEmpty()) {
            config.setClientSecret("********");
        }
        return ResponseEntity.ok(config);
    }

    @PutMapping("/zoho")
    @Operation(summary = "Update Zoho configuration", description = "Updates Zoho integration settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppSettingsDto.ZohoConfig> updateZohoConfig(
            @RequestBody AppSettingsDto.ZohoConfig config) {
        AppSettingsDto.ZohoConfig updated = settingsService.updateZohoConfig(config);
        // Mask the client secret in response
        updated.setClientSecret("********");
        return ResponseEntity.ok(updated);
    }

    // ========================================
    // INDIVIDUAL SETTING ENDPOINTS
    // ========================================

    @PutMapping("/{category}/{key}")
    @Operation(summary = "Update a single setting", description = "Updates a specific setting by category and key")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppSettingsDto> updateSetting(
            @PathVariable String category,
            @PathVariable String key,
            @RequestBody AppSettingsDto.UpdateSettingRequest request) {
        return ResponseEntity.ok(settingsService.updateSetting(category, key, request.getValue()));
    }

    @PutMapping("/bulk")
    @Operation(summary = "Bulk update settings", description = "Updates multiple settings at once")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> bulkUpdateSettings(@RequestBody AppSettingsDto.BulkUpdateRequest request) {
        settingsService.updateSettings(request.getSettings());
        return ResponseEntity.ok().build();
    }
}

