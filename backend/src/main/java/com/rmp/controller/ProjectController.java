package com.rmp.controller;

import com.rmp.dto.ProjectCreateDto;
import com.rmp.dto.ProjectDto;
import com.rmp.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management APIs")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @Operation(summary = "Get all projects", description = "Get paginated list of projects with optional filters")
    public ResponseEntity<Page<ProjectDto>> getAllProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(projectService.getAllProjects(search, status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID", description = "Get single project by ID")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    @Operation(summary = "Create project", description = "Create a new project")
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody ProjectCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    @Operation(summary = "Update project", description = "Update an existing project")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectCreateDto dto) {
        return ResponseEntity.ok(projectService.updateProject(id, dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    @Operation(summary = "Update project status", description = "Update project status")
    public ResponseEntity<ProjectDto> updateProjectStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(projectService.updateProjectStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    @Operation(summary = "Delete project", description = "Delete a project")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/active")
    @Operation(summary = "Get active projects", description = "Get list of active projects")
    public ResponseEntity<List<ProjectDto>> getActiveProjects() {
        return ResponseEntity.ok(projectService.getActiveProjects());
    }
}

