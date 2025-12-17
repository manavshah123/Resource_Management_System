package com.wishtree.rmp.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wishtree.rmp.config.ZohoConfig;
import com.wishtree.rmp.dto.zoho.*;
import com.wishtree.rmp.entity.Employee;
import com.wishtree.rmp.entity.Project;
import com.wishtree.rmp.entity.ZohoIntegration;
import com.wishtree.rmp.repository.EmployeeRepository;
import com.wishtree.rmp.repository.ProjectRepository;
import com.wishtree.rmp.repository.ZohoIntegrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ZohoProjectsService {

    private final ZohoConfig zohoConfig;
    private final ZohoOAuthService zohoOAuthService;
    private final ZohoIntegrationRepository zohoIntegrationRepository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Complete OAuth callback - exchange code and save integration
     */
    @Transactional
    public ZohoIntegrationDto completeOAuthCallback(String code) {
        // Exchange code for tokens
        ZohoTokenResponse tokenResponse = zohoOAuthService.exchangeCodeForToken(code);

        // Get current user
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee connectedBy = employeeRepository.findByEmail(currentUserEmail).orElse(null);

        // Get portal info
        List<ZohoPortalDto> portals = fetchPortals(tokenResponse.getAccessToken());
        ZohoPortalDto defaultPortal = portals.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsDefault()))
                .findFirst()
                .orElse(portals.isEmpty() ? null : portals.get(0));

        // Create or update integration
        ZohoIntegration integration = zohoIntegrationRepository.findLatestIntegration()
                .orElse(new ZohoIntegration());

        integration.setAccessToken(tokenResponse.getAccessToken());
        integration.setRefreshToken(tokenResponse.getRefreshToken());
        integration.setTokenExpiry(LocalDateTime.now().plusSeconds(tokenResponse.getExpiresIn() - 300));
        integration.setStatus(ZohoIntegration.Status.CONNECTED);
        integration.setConnectedBy(connectedBy);

        if (defaultPortal != null) {
            integration.setPortalId(defaultPortal.getId());
            integration.setPortalName(defaultPortal.getName());
        }

        // Get user info from Zoho
        try {
            Map<String, Object> userInfo = fetchCurrentUser(tokenResponse.getAccessToken(), 
                    defaultPortal != null ? defaultPortal.getId() : null);
            if (userInfo != null) {
                integration.setZohoUserName((String) userInfo.get("name"));
                integration.setZohoUserEmail((String) userInfo.get("email"));
            }
        } catch (Exception e) {
            log.warn("Could not fetch Zoho user info: {}", e.getMessage());
        }

        integration = zohoIntegrationRepository.save(integration);
        return ZohoIntegrationDto.fromEntity(integration);
    }

    /**
     * Get current integration status
     */
    @Transactional(readOnly = true)
    public ZohoIntegrationDto getIntegrationStatus() {
        return zohoIntegrationRepository.findLatestIntegration()
                .map(ZohoIntegrationDto::fromEntity)
                .orElse(null);
    }

    /**
     * Disconnect Zoho integration
     */
    @Transactional
    public void disconnect() {
        zohoIntegrationRepository.findLatestIntegration().ifPresent(integration -> {
            integration.setStatus(ZohoIntegration.Status.DISCONNECTED);
            integration.setAccessToken(null);
            integration.setRefreshToken(null);
            integration.setTokenExpiry(null);
            zohoIntegrationRepository.save(integration);
        });
    }

    /**
     * Fetch all portals from Zoho
     */
    public List<ZohoPortalDto> fetchPortals(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            ResponseEntity<String> response = restTemplate.exchange(
                    zohoConfig.getApiBaseUrl() + "/portals/",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode portalsNode = root.get("portals");

            if (portalsNode != null && portalsNode.isArray()) {
                return objectMapper.convertValue(portalsNode, new TypeReference<List<ZohoPortalDto>>() {});
            }

            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to fetch Zoho portals", e);
            throw new RuntimeException("Failed to fetch Zoho portals: " + e.getMessage());
        }
    }

    /**
     * Fetch current user info from Zoho
     */
    private Map<String, Object> fetchCurrentUser(String accessToken, String portalId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);

            String url = zohoConfig.getApiBaseUrl() + "/portal/" + portalId + "/users/";
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode usersNode = root.get("users");

            if (usersNode != null && usersNode.isArray() && usersNode.size() > 0) {
                // Return first user (current user)
                return objectMapper.convertValue(usersNode.get(0), new TypeReference<Map<String, Object>>() {});
            }

            return null;
        } catch (Exception e) {
            log.warn("Failed to fetch Zoho user: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Fetch all projects from Zoho
     */
    public List<ZohoProjectDto> fetchZohoProjects() {
        Optional<ZohoIntegration> integrationOpt = zohoIntegrationRepository.findActiveIntegration();
        
        if (integrationOpt.isEmpty()) {
            throw new RuntimeException("Zoho is not connected");
        }

        ZohoIntegration integration = integrationOpt.get();

        try {
            HttpHeaders headers = zohoOAuthService.createAuthHeaders();

            String url = zohoConfig.getApiBaseUrl() + "/portal/" + integration.getPortalId() + "/projects/";
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode projectsNode = root.get("projects");

            List<ZohoProjectDto> projects = new ArrayList<>();
            if (projectsNode != null && projectsNode.isArray()) {
                projects = objectMapper.convertValue(projectsNode, new TypeReference<List<ZohoProjectDto>>() {});
            }

            // Mark which projects are already imported
            markImportedProjects(projects);

            return projects;
        } catch (Exception e) {
            log.error("Failed to fetch Zoho projects", e);
            throw new RuntimeException("Failed to fetch Zoho projects: " + e.getMessage());
        }
    }

    /**
     * Mark projects that are already imported to RMP
     */
    private void markImportedProjects(List<ZohoProjectDto> zohoProjects) {
        // Find all projects with Zoho IDs matching the fetched projects
        Set<String> zohoIds = zohoProjects.stream()
                .map(ZohoProjectDto::getId)
                .collect(Collectors.toSet());

        // Get existing projects that have description containing Zoho ID marker
        List<Project> existingProjects = projectRepository.findAll();
        Map<String, Long> zohoIdToRmpId = new HashMap<>();

        for (Project p : existingProjects) {
            if (p.getDescription() != null && p.getDescription().contains("[ZOHO:")) {
                String zohoId = extractZohoId(p.getDescription());
                if (zohoId != null) {
                    zohoIdToRmpId.put(zohoId, p.getId());
                }
            }
        }

        for (ZohoProjectDto zohoProject : zohoProjects) {
            if (zohoIdToRmpId.containsKey(zohoProject.getId())) {
                zohoProject.setImported(true);
                zohoProject.setRmpProjectId(zohoIdToRmpId.get(zohoProject.getId()));
            }
        }
    }

    private String extractZohoId(String description) {
        int start = description.indexOf("[ZOHO:");
        if (start >= 0) {
            int end = description.indexOf("]", start);
            if (end > start) {
                return description.substring(start + 6, end);
            }
        }
        return null;
    }

    /**
     * Import selected Zoho projects to RMP
     */
    @Transactional
    public List<Project> importProjects(ZohoImportRequest request) {
        List<ZohoProjectDto> zohoProjects = fetchZohoProjects();
        
        // Filter to only requested projects
        List<ZohoProjectDto> toImport = zohoProjects.stream()
                .filter(p -> request.getProjectIds().contains(p.getId()))
                .collect(Collectors.toList());

        Employee defaultManager = null;
        if (request.getDefaultManagerId() != null) {
            defaultManager = employeeRepository.findById(request.getDefaultManagerId()).orElse(null);
        }

        List<Project> importedProjects = new ArrayList<>();

        for (ZohoProjectDto zohoProject : toImport) {
            // Skip if already imported and updateExisting is false
            if (zohoProject.getImported() && !Boolean.TRUE.equals(request.getUpdateExisting())) {
                continue;
            }

            Project project;
            if (zohoProject.getImported() && zohoProject.getRmpProjectId() != null) {
                // Update existing
                project = projectRepository.findById(zohoProject.getRmpProjectId()).orElse(new Project());
            } else {
                project = new Project();
            }

            // Map Zoho project to RMP project
            project.setName(zohoProject.getName());
            project.setClient("Zoho Import"); // Can be customized
            project.setDescription(buildDescription(zohoProject));
            project.setStatus(mapZohoStatus(zohoProject.getStatus()));
            project.setPriority(Project.Priority.MEDIUM);
            project.setStartDate(parseDate(zohoProject.getStartDate(), zohoProject.getStartDateFormat()));
            project.setEndDate(parseDate(zohoProject.getEndDate(), zohoProject.getEndDateFormat()));
            
            if (defaultManager != null) {
                project.setManager(defaultManager);
            }

            // Calculate progress based on task counts
            if (zohoProject.getTaskCount() != null) {
                int total = zohoProject.getTaskCount().getOpen() + zohoProject.getTaskCount().getClosed();
                if (total > 0) {
                    project.setProgress((zohoProject.getTaskCount().getClosed() * 100) / total);
                }
            }

            project = projectRepository.save(project);
            importedProjects.add(project);
        }

        // Update last sync time
        zohoIntegrationRepository.findActiveIntegration().ifPresent(integration -> {
            integration.setLastSync(LocalDateTime.now());
            zohoIntegrationRepository.save(integration);
        });

        return importedProjects;
    }

    private String buildDescription(ZohoProjectDto zohoProject) {
        StringBuilder desc = new StringBuilder();
        if (zohoProject.getDescription() != null && !zohoProject.getDescription().isEmpty()) {
            desc.append(zohoProject.getDescription()).append("\n\n");
        }
        desc.append("[ZOHO:").append(zohoProject.getId()).append("]");
        return desc.toString();
    }

    private Project.Status mapZohoStatus(String zohoStatus) {
        if (zohoStatus == null) return Project.Status.NOT_STARTED;
        
        return switch (zohoStatus.toLowerCase()) {
            case "active", "in progress" -> Project.Status.IN_PROGRESS;
            case "completed", "closed" -> Project.Status.COMPLETED;
            case "on hold", "hold" -> Project.Status.ON_HOLD;
            case "cancelled", "canceled" -> Project.Status.CANCELLED;
            default -> Project.Status.NOT_STARTED;
        };
    }

    private LocalDate parseDate(String date, String format) {
        if (date == null || date.isEmpty()) {
            return LocalDate.now();
        }

        try {
            // Try common Zoho date formats
            String[] formats = {"MM-dd-yyyy", "yyyy-MM-dd", "dd-MM-yyyy", "MM/dd/yyyy"};
            for (String f : formats) {
                try {
                    return LocalDate.parse(date, DateTimeFormatter.ofPattern(f));
                } catch (Exception ignored) {}
            }
            return LocalDate.now();
        } catch (Exception e) {
            return LocalDate.now();
        }
    }

    /**
     * Get available portals for the connected account
     */
    public List<ZohoPortalDto> getPortals() {
        String accessToken = zohoOAuthService.getValidAccessToken();
        return fetchPortals(accessToken);
    }

    /**
     * Fetch all users from Zoho portal
     */
    public List<ZohoUserDto> fetchZohoUsers() {
        Optional<ZohoIntegration> integrationOpt = zohoIntegrationRepository.findActiveIntegration();
        
        if (integrationOpt.isEmpty()) {
            throw new RuntimeException("Zoho is not connected");
        }

        ZohoIntegration integration = integrationOpt.get();
        HttpHeaders headers = zohoOAuthService.createAuthHeaders();

        // Try portal users endpoint first
        try {
            String url = zohoConfig.getApiBaseUrl() + "/portal/" + integration.getPortalId() + "/users/";
            log.info("Fetching Zoho users from URL: {}", url);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode usersNode = root.get("users");

            List<ZohoUserDto> users = new ArrayList<>();
            if (usersNode != null && usersNode.isArray()) {
                users = objectMapper.convertValue(usersNode, new TypeReference<List<ZohoUserDto>>() {});
            }

            markImportedUsers(users);
            return users;
        } catch (Exception e) {
            log.warn("Failed to fetch portal users (may require admin access), trying project-based approach: {}", e.getMessage());
        }

        // Fallback: Collect users from all projects
        try {
            log.info("Fetching users from projects as fallback...");
            Set<String> seenUserIds = new HashSet<>();
            List<ZohoUserDto> allUsers = new ArrayList<>();

            // Get all projects first
            List<ZohoProjectDto> projects = fetchZohoProjects();
            
            for (ZohoProjectDto project : projects) {
                try {
                    String projectUsersUrl = zohoConfig.getApiBaseUrl() + "/portal/" + integration.getPortalId() 
                            + "/projects/" + project.getId() + "/users/";
                    log.debug("Fetching users from project: {}", project.getName());
                    
                    ResponseEntity<String> response = restTemplate.exchange(
                            projectUsersUrl,
                            HttpMethod.GET,
                            new HttpEntity<>(headers),
                            String.class
                    );

                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode usersNode = root.get("users");

                    if (usersNode != null && usersNode.isArray()) {
                        List<ZohoUserDto> projectUsers = objectMapper.convertValue(usersNode, new TypeReference<List<ZohoUserDto>>() {});
                        for (ZohoUserDto user : projectUsers) {
                            if (!seenUserIds.contains(user.getId())) {
                                seenUserIds.add(user.getId());
                                allUsers.add(user);
                            }
                        }
                    }
                } catch (Exception projectEx) {
                    log.debug("Could not fetch users from project {}: {}", project.getName(), projectEx.getMessage());
                }
            }

            markImportedUsers(allUsers);
            log.info("Found {} unique users from {} projects", allUsers.size(), projects.size());
            return allUsers;
        } catch (Exception e) {
            log.error("Failed to fetch Zoho users", e);
            throw new RuntimeException("Failed to fetch Zoho users: " + e.getMessage());
        }
    }

    /**
     * Mark users that already exist in RMP (by matching email)
     */
    private void markImportedUsers(List<ZohoUserDto> zohoUsers) {
        // Get all existing employee emails
        List<Employee> existingEmployees = employeeRepository.findAll();
        Map<String, Long> emailToEmployeeId = existingEmployees.stream()
                .filter(e -> e.getEmail() != null)
                .collect(Collectors.toMap(
                        e -> e.getEmail().toLowerCase(),
                        Employee::getId,
                        (a, b) -> a // In case of duplicates, keep first
                ));

        for (ZohoUserDto zohoUser : zohoUsers) {
            if (zohoUser.getEmail() != null) {
                String email = zohoUser.getEmail().toLowerCase();
                if (emailToEmployeeId.containsKey(email)) {
                    zohoUser.setImported(true);
                    zohoUser.setMatchedEmployeeId(emailToEmployeeId.get(email));
                }
            }
        }
    }

    /**
     * Update integration settings
     */
    @Transactional
    public ZohoIntegrationDto updateSettings(Long integrationId, Boolean syncEnabled, Boolean autoImport, String portalId) {
        ZohoIntegration integration = zohoIntegrationRepository.findById(integrationId)
                .orElseThrow(() -> new RuntimeException("Integration not found"));

        if (syncEnabled != null) {
            integration.setSyncEnabled(syncEnabled);
        }
        if (autoImport != null) {
            integration.setAutoImport(autoImport);
        }
        if (portalId != null && !portalId.equals(integration.getPortalId())) {
            integration.setPortalId(portalId);
            // Update portal name
            try {
                List<ZohoPortalDto> portals = getPortals();
                final ZohoIntegration finalIntegration = integration;
                portals.stream()
                        .filter(p -> p.getId().equals(portalId))
                        .findFirst()
                        .ifPresent(p -> finalIntegration.setPortalName(p.getName()));
            } catch (Exception e) {
                log.warn("Could not update portal name: {}", e.getMessage());
            }
        }

        ZohoIntegration savedIntegration = zohoIntegrationRepository.save(integration);
        return ZohoIntegrationDto.fromEntity(savedIntegration);
    }

    /**
     * Fetch timesheets from Zoho People API
     * API: https://people.zoho.com/people/api/timetracker/gettimesheet
     * Scope: ZOHOPEOPLE.timetracker.READ
     */
    public List<ZohoTimesheetDto> fetchZohoTimesheets(String projectId) {
        Optional<ZohoIntegration> integrationOpt = zohoIntegrationRepository.findActiveIntegration();
        
        if (integrationOpt.isEmpty()) {
            throw new RuntimeException("Zoho is not connected");
        }

        HttpHeaders headers = zohoOAuthService.createAuthHeaders();

        try {
            // Zoho People API for timesheets
            // Reference: https://www.zoho.com/people/api/timesheet/get-timesheets.html
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(30);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy");
            
            String url = "https://people.zoho.com/people/api/timetracker/gettimesheet"
                    + "?user=all"
                    + "&approvalStatus=all"
                    + "&employeeStatus=users"
                    + "&dateFormat=dd-MMM-yyyy"
                    + "&fromDate=" + startDate.format(formatter)
                    + "&toDate=" + endDate.format(formatter)
                    + "&sIndex=0"
                    + "&limit=200";
            
            log.info("Fetching timesheets from Zoho People: {}", url);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class
            );
            
            log.info("Timesheet response: {}", response.getBody());

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode responseNode = root.get("response");
            
            if (responseNode != null) {
                JsonNode statusNode = responseNode.get("status");
                if (statusNode != null && statusNode.asInt() != 0) {
                    // Error response
                    JsonNode errorsNode = responseNode.get("errors");
                    if (errorsNode != null && errorsNode.isArray() && errorsNode.size() > 0) {
                        String errorMsg = errorsNode.get(0).get("message").asText();
                        log.error("Zoho People API error: {}", errorMsg);
                        throw new RuntimeException("Zoho People error: " + errorMsg);
                    }
                }
                
                JsonNode resultNode = responseNode.get("result");
                if (resultNode != null && resultNode.isArray()) {
                    List<ZohoTimesheetDto> timesheets = new ArrayList<>();
                    for (JsonNode ts : resultNode) {
                        ZohoTimesheetDto dto = ZohoTimesheetDto.builder()
                                .id(getTextOrNull(ts, "recordId"))
                                .ownerName(getTextOrNull(ts, "employeeName"))
                                .ownerId(getTextOrNull(ts, "erecno"))
                                .taskName(getTextOrNull(ts, "timesheetName"))
                                .notes(getTextOrNull(ts, "description"))
                                .logDate(getTextOrNull(ts, "fromDate"))
                                .hoursDisplay(getTextOrNull(ts, "totalHours"))
                                .approvalStatus(getTextOrNull(ts, "status"))
                                .billStatus(getTextOrNull(ts, "billableHours") != null ? "Billable" : "Non-Billable")
                                .build();
                        timesheets.add(dto);
                    }
                    log.info("Fetched {} timesheets from Zoho People", timesheets.size());
                    return timesheets;
                }
            }
            
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Failed to fetch Zoho timesheets: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch Zoho timesheets: " + e.getMessage());
        }
    }
    
    private String getTextOrNull(JsonNode node, String field) {
        JsonNode fieldNode = node.get(field);
        return fieldNode != null && !fieldNode.isNull() ? fieldNode.asText() : null;
    }
}

