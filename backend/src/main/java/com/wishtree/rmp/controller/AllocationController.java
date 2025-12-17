package com.wishtree.rmp.controller;

import com.wishtree.rmp.dto.AllocationCreateDto;
import com.wishtree.rmp.dto.AllocationDto;
import com.wishtree.rmp.service.AllocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/allocations")
@RequiredArgsConstructor
@Tag(name = "Allocations", description = "Resource allocation management APIs")
public class AllocationController {

    private final AllocationService allocationService;

    @GetMapping
    @Operation(summary = "Get all allocations", description = "Get paginated list of allocations")
    public ResponseEntity<Page<AllocationDto>> getAllAllocations(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(allocationService.getAllAllocations(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get allocation by ID", description = "Get single allocation by ID")
    public ResponseEntity<AllocationDto> getAllocationById(@PathVariable Long id) {
        return ResponseEntity.ok(allocationService.getAllocationById(id));
    }

    @GetMapping("/by-employee/{employeeId}")
    @Operation(summary = "Get allocations by employee", description = "Get all allocations for an employee")
    public ResponseEntity<List<AllocationDto>> getAllocationsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(allocationService.getAllocationsByEmployee(employeeId));
    }

    @GetMapping("/by-project/{projectId}")
    @Operation(summary = "Get allocations by project", description = "Get all allocations for a project")
    public ResponseEntity<List<AllocationDto>> getAllocationsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(allocationService.getAllocationsByProject(projectId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    @Operation(summary = "Create allocation", description = "Create a new resource allocation")
    public ResponseEntity<AllocationDto> createAllocation(@Valid @RequestBody AllocationCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(allocationService.createAllocation(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    @Operation(summary = "Update allocation", description = "Update an existing allocation")
    public ResponseEntity<AllocationDto> updateAllocation(
            @PathVariable Long id,
            @Valid @RequestBody AllocationCreateDto dto) {
        return ResponseEntity.ok(allocationService.updateAllocation(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    @Operation(summary = "Delete allocation", description = "Delete an allocation")
    public ResponseEntity<Void> deleteAllocation(@PathVariable Long id) {
        allocationService.deleteAllocation(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check-availability")
    @Operation(summary = "Check employee availability", description = "Check employee availability for a period")
    public ResponseEntity<Map<String, Integer>> checkAvailability(
            @RequestParam Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Integer availability = allocationService.checkAvailability(employeeId, startDate, endDate);
        return ResponseEntity.ok(Map.of("availablePercentage", availability));
    }

    @GetMapping("/upcoming-end")
    @Operation(summary = "Get upcoming deallocations", description = "Get allocations ending soon")
    public ResponseEntity<List<AllocationDto>> getUpcomingDeallocations(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(allocationService.getUpcomingDeallocations(days));
    }
}

