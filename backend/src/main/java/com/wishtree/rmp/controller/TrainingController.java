package com.wishtree.rmp.controller;

import com.wishtree.rmp.dto.TrainingAssignmentDto;
import com.wishtree.rmp.dto.TrainingDto;
import com.wishtree.rmp.dto.TrainingModuleDto;
import com.wishtree.rmp.entity.User;
import com.wishtree.rmp.repository.UserRepository;
import com.wishtree.rmp.service.TrainingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/trainings")
@RequiredArgsConstructor
@Tag(name = "Trainings", description = "Training management APIs")
public class TrainingController {

    private final TrainingService trainingService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get all trainings")
    public ResponseEntity<Page<TrainingDto>> getAllTrainings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(trainingService.getAllTrainings(search, category, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get training by ID")
    public ResponseEntity<TrainingDto> getTrainingById(@PathVariable Long id) {
        return ResponseEntity.ok(trainingService.getTrainingById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create new training")
    public ResponseEntity<TrainingDto> createTraining(@RequestBody TrainingDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trainingService.createTraining(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update training")
    public ResponseEntity<TrainingDto> updateTraining(@PathVariable Long id, @RequestBody TrainingDto dto) {
        return ResponseEntity.ok(trainingService.updateTraining(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Delete training")
    public ResponseEntity<Void> deleteTraining(@PathVariable Long id) {
        trainingService.deleteTraining(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/skills/{skillId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Add skill to training")
    public ResponseEntity<TrainingDto> addSkillToTraining(
            @PathVariable Long id, 
            @PathVariable Long skillId) {
        return ResponseEntity.ok(trainingService.addSkillToTraining(id, skillId));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PM')")
    @Operation(summary = "Assign training to employee")
    public ResponseEntity<TrainingAssignmentDto> assignTraining(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        Long employeeId = Long.valueOf(request.get("employeeId").toString());
        LocalDate dueDate = request.get("dueDate") != null ? 
                LocalDate.parse(request.get("dueDate").toString()) : null;
        String remarks = (String) request.get("remarks");
        
        return ResponseEntity.ok(trainingService.assignTraining(id, employeeId, dueDate, remarks));
    }

    @PostMapping("/{id}/bulk-assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PM')")
    @Operation(summary = "Bulk assign training to employees")
    public ResponseEntity<List<TrainingAssignmentDto>> bulkAssignTraining(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        List<Long> employeeIds = ((List<?>) request.get("employeeIds")).stream()
                .map(o -> Long.valueOf(o.toString()))
                .collect(Collectors.toList());
        LocalDate dueDate = request.get("dueDate") != null ? 
                LocalDate.parse(request.get("dueDate").toString()) : null;
        String remarks = (String) request.get("remarks");
        
        return ResponseEntity.ok(trainingService.bulkAssignTraining(id, employeeIds, dueDate, remarks));
    }

    @GetMapping("/{id}/assignments")
    @Operation(summary = "Get training assignments")
    public ResponseEntity<List<TrainingAssignmentDto>> getTrainingAssignments(@PathVariable Long id) {
        return ResponseEntity.ok(trainingService.getAssignmentsByTraining(id));
    }

    @GetMapping("/assignments/employee/{employeeId}")
    @Operation(summary = "Get employee's training assignments")
    public ResponseEntity<List<TrainingAssignmentDto>> getEmployeeAssignments(@PathVariable Long employeeId) {
        return ResponseEntity.ok(trainingService.getAssignmentsByEmployee(employeeId));
    }

    @PatchMapping("/assignments/{assignmentId}/progress")
    @Operation(summary = "Update training progress")
    public ResponseEntity<TrainingAssignmentDto> updateProgress(
            @PathVariable Long assignmentId,
            @RequestBody Map<String, Object> request) {
        int progress = Integer.parseInt(request.get("progress").toString());
        String notes = (String) request.get("notes");
        return ResponseEntity.ok(trainingService.updateProgress(assignmentId, progress, notes));
    }

    @PostMapping("/assignments/{assignmentId}/complete")
    @Operation(summary = "Complete training")
    public ResponseEntity<TrainingAssignmentDto> completeTraining(
            @PathVariable Long assignmentId,
            @RequestBody(required = false) Map<String, String> request) {
        String proofUrl = request != null ? request.get("proofUrl") : null;
        return ResponseEntity.ok(trainingService.completeTraining(assignmentId, proofUrl));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get training statistics")
    public ResponseEntity<Map<String, Object>> getTrainingStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("activeTrainings", trainingService.getActiveTrainingCount());
        stats.put("categoryDistribution", trainingService.getTrainingCategoryStats());
        stats.put("assignmentStatus", trainingService.getAssignmentStatusStats());
        return ResponseEntity.ok(stats);
    }

    // ============ Module Endpoints ============

    @GetMapping("/{id}/modules")
    @Operation(summary = "Get training with modules")
    public ResponseEntity<TrainingDto> getTrainingWithModules(@PathVariable Long id) {
        return ResponseEntity.ok(trainingService.getTrainingWithModules(id));
    }

    @PostMapping("/{id}/modules")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Add module to training")
    public ResponseEntity<TrainingModuleDto> addModule(
            @PathVariable Long id,
            @RequestBody TrainingModuleDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trainingService.addModule(id, dto));
    }

    @PutMapping("/modules/{moduleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update module")
    public ResponseEntity<TrainingModuleDto> updateModule(
            @PathVariable Long moduleId,
            @RequestBody TrainingModuleDto dto) {
        return ResponseEntity.ok(trainingService.updateModule(moduleId, dto));
    }

    @DeleteMapping("/modules/{moduleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Delete module")
    public ResponseEntity<Void> deleteModule(@PathVariable Long moduleId) {
        trainingService.deleteModule(moduleId);
        return ResponseEntity.noContent().build();
    }

    // ============ Progress Tracking Endpoints ============

    @GetMapping("/assignments/{assignmentId}/details")
    @Operation(summary = "Get assignment with progress details")
    public ResponseEntity<TrainingAssignmentDto> getAssignmentWithProgress(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(trainingService.getAssignmentWithProgress(assignmentId));
    }

    @PostMapping("/assignments/{assignmentId}/modules/{moduleId}/start")
    @Operation(summary = "Start a module")
    public ResponseEntity<TrainingModuleDto> startModule(
            @PathVariable Long assignmentId,
            @PathVariable Long moduleId) {
        return ResponseEntity.ok(trainingService.startModule(assignmentId, moduleId));
    }

    @PostMapping("/assignments/{assignmentId}/modules/{moduleId}/complete")
    @Operation(summary = "Complete a module")
    public ResponseEntity<TrainingModuleDto> completeModule(
            @PathVariable Long assignmentId,
            @PathVariable Long moduleId,
            @RequestBody(required = false) Map<String, Object> request) {
        String notes = request != null ? (String) request.get("notes") : null;
        Integer timeSpent = request != null && request.get("timeSpentMinutes") != null ? 
                Integer.parseInt(request.get("timeSpentMinutes").toString()) : null;
        return ResponseEntity.ok(trainingService.completeModule(assignmentId, moduleId, notes, timeSpent));
    }

    // ============ My Trainings (for employees) ============

    @GetMapping("/my")
    @Operation(summary = "Get my assigned trainings")
    public ResponseEntity<List<TrainingAssignmentDto>> getMyTrainings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null || user.getEmployee() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(trainingService.getMyTrainings(user.getEmployee().getId()));
    }

    @GetMapping("/team-progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM', 'HR')")
    @Operation(summary = "Get training progress of team members")
    public ResponseEntity<List<TrainingAssignmentDto>> getTeamProgress() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null || user.getEmployee() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(trainingService.getEmployeeProgressForManager(user.getEmployee().getId()));
    }
}

