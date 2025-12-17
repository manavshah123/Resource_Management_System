package com.wishtree.rmp.controller;

import com.wishtree.rmp.config.ZohoConfig;
import com.wishtree.rmp.dto.ProjectDto;
import com.wishtree.rmp.dto.zoho.*;
import com.wishtree.rmp.entity.Project;
import com.wishtree.rmp.service.ZohoProjectsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/integrations/zoho")
@RequiredArgsConstructor
@Tag(name = "Zoho Integration", description = "APIs for integrating with Zoho Projects")
public class ZohoIntegrationController {

    private final ZohoConfig zohoConfig;
    private final ZohoProjectsService zohoProjectsService;

    @GetMapping("/status")
    @Operation(summary = "Get Zoho integration status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    public ResponseEntity<ZohoIntegrationDto> getStatus() {
        ZohoIntegrationDto status = zohoProjectsService.getIntegrationStatus();
        return ResponseEntity.ok(status);
    }

    @GetMapping("/config")
    @Operation(summary = "Check if Zoho integration is configured")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    public ResponseEntity<Map<String, Object>> getConfig() {
        log.info("Zoho Config - Enabled: {}, ClientId: {}, ClientSecret length: {}", 
            zohoConfig.getEnabled(), 
            zohoConfig.getClientId(),
            zohoConfig.getClientSecret() != null ? zohoConfig.getClientSecret().length() : 0);
        
        Map<String, Object> config = new HashMap<>();
        config.put("enabled", zohoConfig.getEnabled());
        config.put("configured", zohoConfig.getClientId() != null && !zohoConfig.getClientId().isEmpty());
        return ResponseEntity.ok(config);
    }

    @GetMapping("/auth-url")
    @Operation(summary = "Get Zoho OAuth authorization URL")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    public ResponseEntity<Map<String, String>> getAuthUrl() {
        if (!Boolean.TRUE.equals(zohoConfig.getEnabled())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Zoho integration is not enabled"));
        }

        if (zohoConfig.getClientId() == null || zohoConfig.getClientId().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Zoho client ID is not configured"));
        }

        String authUrl = zohoProjectsService.getIntegrationStatus() != null 
                && zohoProjectsService.getIntegrationStatus().getStatus() == com.wishtree.rmp.entity.ZohoIntegration.Status.CONNECTED
                ? null 
                : String.format(
                    "%s?scope=%s&client_id=%s&response_type=code&access_type=offline&redirect_uri=%s&prompt=consent",
                    zohoConfig.getAuthUrl(),
                    zohoConfig.getScopes(),
                    zohoConfig.getClientId(),
                    zohoConfig.getRedirectUri()
                );

        Map<String, String> response = new HashMap<>();
        response.put("authUrl", authUrl);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/callback")
    @Operation(summary = "Handle OAuth callback from Zoho")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    public ResponseEntity<ZohoIntegrationDto> handleCallback(@RequestParam String code) {
        try {
            ZohoIntegrationDto integration = zohoProjectsService.completeOAuthCallback(code);
            return ResponseEntity.ok(integration);
        } catch (Exception e) {
            log.error("Failed to complete Zoho OAuth", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/disconnect")
    @Operation(summary = "Disconnect Zoho integration")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> disconnect() {
        zohoProjectsService.disconnect();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/portals")
    @Operation(summary = "Get available Zoho portals")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    public ResponseEntity<List<ZohoPortalDto>> getPortals() {
        try {
            List<ZohoPortalDto> portals = zohoProjectsService.getPortals();
            return ResponseEntity.ok(portals);
        } catch (Exception e) {
            log.error("Failed to fetch Zoho portals", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/projects")
    @Operation(summary = "Fetch projects from Zoho")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    public ResponseEntity<List<ZohoProjectDto>> getZohoProjects() {
        try {
            List<ZohoProjectDto> projects = zohoProjectsService.fetchZohoProjects();
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            log.error("Failed to fetch Zoho projects", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/users")
    @Operation(summary = "Fetch users/team members from Zoho")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    public ResponseEntity<List<ZohoUserDto>> getZohoUsers() {
        try {
            List<ZohoUserDto> users = zohoProjectsService.fetchZohoUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Failed to fetch Zoho users", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/timesheets")
    @Operation(summary = "Fetch timesheets/timelogs from Zoho")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    public ResponseEntity<List<ZohoTimesheetDto>> getZohoTimesheets(
            @RequestParam(required = false) String projectId) {
        try {
            List<ZohoTimesheetDto> timesheets = zohoProjectsService.fetchZohoTimesheets(projectId);
            return ResponseEntity.ok(timesheets);
        } catch (Exception e) {
            log.error("Failed to fetch Zoho timesheets", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/projects/import")
    @Operation(summary = "Import selected projects from Zoho")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    public ResponseEntity<List<ProjectDto>> importProjects(@RequestBody ZohoImportRequest request) {
        try {
            List<Project> imported = zohoProjectsService.importProjects(request);
            List<ProjectDto> result = imported.stream()
                    .map(ProjectDto::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to import Zoho projects", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/settings/{integrationId}")
    @Operation(summary = "Update integration settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ZohoIntegrationDto> updateSettings(
            @PathVariable Long integrationId,
            @RequestBody Map<String, Object> settings) {
        
        Boolean syncEnabled = settings.containsKey("syncEnabled") 
                ? (Boolean) settings.get("syncEnabled") 
                : null;
        Boolean autoImport = settings.containsKey("autoImport") 
                ? (Boolean) settings.get("autoImport") 
                : null;
        String portalId = settings.containsKey("portalId") 
                ? (String) settings.get("portalId") 
                : null;

        ZohoIntegrationDto updated = zohoProjectsService.updateSettings(
                integrationId, syncEnabled, autoImport, portalId);
        return ResponseEntity.ok(updated);
    }
}

