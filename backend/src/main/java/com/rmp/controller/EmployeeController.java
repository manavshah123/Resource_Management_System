package com.rmp.controller;

import com.rmp.dto.EmployeeCreateDto;
import com.rmp.dto.EmployeeDto;
import com.rmp.dto.EmployeeProfileDto;
import com.rmp.service.EmployeeService;
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
@RequestMapping("/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Employee management APIs")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @Operation(summary = "Get all employees", description = "Get paginated list of employees with optional filters")
    public ResponseEntity<Page<EmployeeDto>> getAllEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(employeeService.getAllEmployees(search, department, status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID", description = "Get single employee by ID")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @GetMapping("/{id}/profile")
    @Operation(summary = "Get employee profile", description = "Get comprehensive employee profile with all details")
    public ResponseEntity<EmployeeProfileDto> getEmployeeProfile(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeProfile(id));
    }

    @PatchMapping("/{id}/max-fte")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update employee max FTE", description = "Update maximum FTE capacity for employee (1 FTE = 8 hours/day)")
    public ResponseEntity<EmployeeDto> updateEmployeeMaxFTE(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        Double maxFTE;
        if (request.containsKey("maxFTE")) {
            maxFTE = ((Number) request.get("maxFTE")).doubleValue();
        } else if (request.containsKey("maxFT")) {
            // Convert percentage to FTE for backward compatibility
            maxFTE = ((Number) request.get("maxFT")).doubleValue() / 100.0;
        } else {
            throw new IllegalArgumentException("maxFTE or maxFT is required");
        }
        return ResponseEntity.ok(employeeService.updateEmployeeMaxFTE(id, maxFTE));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create employee", description = "Create a new employee")
    public ResponseEntity<EmployeeDto> createEmployee(@Valid @RequestBody EmployeeCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.createEmployee(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update employee", description = "Update an existing employee")
    public ResponseEntity<EmployeeDto> updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeCreateDto dto) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Delete employee", description = "Delete an employee")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/available")
    @Operation(summary = "Get available employees", description = "Get employees with availability")
    public ResponseEntity<List<EmployeeDto>> getAvailableEmployees(
            @RequestParam(defaultValue = "50") int minAvailability) {
        return ResponseEntity.ok(employeeService.getAvailableEmployees(minAvailability));
    }

    @GetMapping("/bench")
    @Operation(summary = "Get bench employees", description = "Get employees currently on bench")
    public ResponseEntity<List<EmployeeDto>> getBenchEmployees() {
        return ResponseEntity.ok(employeeService.getBenchEmployees());
    }

    @GetMapping("/departments")
    @Operation(summary = "Get all departments", description = "Get list of all departments")
    public ResponseEntity<List<String>> getDepartments() {
        return ResponseEntity.ok(employeeService.getAllDepartments());
    }

    @GetMapping("/with-availability")
    @Operation(summary = "Get all employees with availability", description = "Get all active employees with their current allocation and availability info")
    public ResponseEntity<List<EmployeeDto>> getAllEmployeesWithAvailability() {
        return ResponseEntity.ok(employeeService.getAllEmployeesWithAvailability());
    }
}

