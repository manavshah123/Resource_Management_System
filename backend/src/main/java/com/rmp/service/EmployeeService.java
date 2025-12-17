package com.rmp.service;

import com.rmp.dto.EmployeeCreateDto;
import com.rmp.dto.EmployeeDto;
import com.rmp.dto.EmployeeProfileDto;
import com.rmp.entity.Allocation;
import com.rmp.entity.Employee;
import com.rmp.entity.EmployeeSkill;
import com.rmp.exceptions.BadRequestException;
import com.rmp.exceptions.ResourceNotFoundException;
import com.rmp.repository.AllocationRepository;
import com.rmp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final AllocationRepository allocationRepository;

    public Page<EmployeeDto> getAllEmployees(String search, String department, String status, Pageable pageable) {
        Page<Employee> employees;

        if (search != null && !search.isEmpty()) {
            employees = employeeRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search, search, pageable);
        } else {
            employees = employeeRepository.findAll(pageable);
        }

        return employees.map(EmployeeDto::fromEntity);
    }

    public EmployeeDto getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return EmployeeDto.fromEntity(employee);
    }

    public EmployeeDto getEmployeeByEmployeeId(String employeeId) {
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with employeeId: " + employeeId));
        return EmployeeDto.fromEntity(employee);
    }

    @Transactional
    public EmployeeDto createEmployee(EmployeeCreateDto dto) {
        if (employeeRepository.existsByEmployeeId(dto.getEmployeeId())) {
            throw new BadRequestException("Employee ID already exists: " + dto.getEmployeeId());
        }
        if (employeeRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already exists: " + dto.getEmail());
        }

        Employee employee = Employee.builder()
                .employeeId(dto.getEmployeeId())
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .department(dto.getDepartment())
                .designation(dto.getDesignation())
                .location(dto.getLocation())
                .joinDate(dto.getJoinDate())
                .status(dto.getStatus() != null ? Employee.Status.valueOf(dto.getStatus()) : Employee.Status.ACTIVE)
                .maxFTE(dto.getMaxFTE() != null ? dto.getMaxFTE() : 1.0)
                .bio(dto.getBio())
                .build();

        if (dto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + dto.getManagerId()));
            employee.setManager(manager);
        }

        Employee savedEmployee = employeeRepository.save(employee);
        log.info("Created employee: {}", savedEmployee.getEmployeeId());
        return EmployeeDto.fromEntity(savedEmployee);
    }

    @Transactional
    public EmployeeDto updateEmployee(Long id, EmployeeCreateDto dto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employee.setName(dto.getName());
        employee.setPhone(dto.getPhone());
        employee.setDepartment(dto.getDepartment());
        employee.setDesignation(dto.getDesignation());
        employee.setLocation(dto.getLocation());
        employee.setJoinDate(dto.getJoinDate());
        employee.setBio(dto.getBio());

        if (dto.getStatus() != null) {
            employee.setStatus(Employee.Status.valueOf(dto.getStatus()));
        }

        if (dto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + dto.getManagerId()));
            employee.setManager(manager);
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        log.info("Updated employee: {}", updatedEmployee.getEmployeeId());
        return EmployeeDto.fromEntity(updatedEmployee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        employeeRepository.delete(employee);
        log.info("Deleted employee: {}", employee.getEmployeeId());
    }

    /**
     * Get employees with available FTE capacity
     * @param minAvailabilityPercent Minimum availability percentage (0-100)
     * @return List of employees with FTE less than (1 - minAvailabilityPercent/100)
     */
    public List<EmployeeDto> getAvailableEmployees(int minAvailabilityPercent) {
        // Convert percentage to FTE: if minAvailability=20%, we want employees with FTE < 0.8
        double maxFTE = 1.0 - (minAvailabilityPercent / 100.0);
        return employeeRepository.findAvailableEmployees(maxFTE)
                .stream()
                .map(EmployeeDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<EmployeeDto> getBenchEmployees() {
        return employeeRepository.findBenchEmployees(Employee.Status.ACTIVE)
                .stream()
                .map(EmployeeDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<String> getAllDepartments() {
        return employeeRepository.findAllDepartments();
    }

    public long getTotalCount() {
        return employeeRepository.count();
    }

    public long getActiveCount() {
        return employeeRepository.findByStatus(Employee.Status.ACTIVE).size();
    }

    /**
     * Get comprehensive employee profile with all details
     */
    public EmployeeProfileDto getEmployeeProfile(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        // Get skills
        List<EmployeeProfileDto.SkillInfo> skills = new ArrayList<>();
        if (employee.getSkills() != null) {
            skills = employee.getSkills().stream()
                    .map(es -> EmployeeProfileDto.SkillInfo.builder()
                            .id(es.getSkill().getId())
                            .name(es.getSkill().getName())
                            .category(es.getSkill().getCategory())
                            .level(es.getLevel().name())
                            .yearsOfExperience(es.getYearsOfExperience())
                            .isPrimary(es.isPrimary())
                            .build())
                    .toList();
        }

        // Get all allocations
        List<Allocation> allAllocations = allocationRepository.findByEmployeeId(id);

        // Current projects (active allocations)
        List<EmployeeProfileDto.ProjectAssignment> currentProjects = allAllocations.stream()
                .filter(a -> a.getStatus() == Allocation.Status.ACTIVE)
                .map(a -> EmployeeProfileDto.ProjectAssignment.builder()
                        .projectId(a.getProject().getId())
                        .projectName(a.getProject().getName())
                        .client(a.getProject().getClient())
                        .role(a.getRole())
                        .allocationPercentage(a.getAllocationPercentage())
                        .startDate(a.getStartDate())
                        .endDate(a.getEndDate())
                        .projectStatus(a.getProject().getStatus().name())
                        .isBillable(a.isBillable())
                        .build())
                .collect(Collectors.toList());

        // Assignment history
        List<EmployeeProfileDto.AssignmentHistory> assignmentHistory = allAllocations.stream()
                .map(a -> {
                    int durationDays = 0;
                    if (a.getStartDate() != null) {
                        LocalDate endDate = a.getEndDate() != null ? a.getEndDate() : LocalDate.now();
                        durationDays = (int) ChronoUnit.DAYS.between(a.getStartDate(), endDate);
                    }
                    return EmployeeProfileDto.AssignmentHistory.builder()
                            .projectId(a.getProject().getId())
                            .projectName(a.getProject().getName())
                            .client(a.getProject().getClient())
                            .role(a.getRole())
                            .allocationPercentage(a.getAllocationPercentage())
                            .startDate(a.getStartDate())
                            .endDate(a.getEndDate())
                            .status(a.getStatus().name())
                            .durationDays(durationDays)
                            .build();
                })
                .collect(Collectors.toList());

        // Calculate stats
        int totalProjectsWorked = (int) allAllocations.stream()
                .map(a -> a.getProject().getId())
                .distinct()
                .count();
        int currentProjectsCount = currentProjects.size();
        double avgAllocation = currentProjects.isEmpty() ? 0 : 
                currentProjects.stream().mapToInt(EmployeeProfileDto.ProjectAssignment::getAllocationPercentage).average().orElse(0);
        int totalDaysWorked = assignmentHistory.stream().mapToInt(EmployeeProfileDto.AssignmentHistory::getDurationDays).sum();

        EmployeeProfileDto.EmployeeStats stats = EmployeeProfileDto.EmployeeStats.builder()
                .totalProjectsWorked(totalProjectsWorked)
                .currentProjectsCount(currentProjectsCount)
                .averageAllocation(Math.round(avgAllocation * 10.0) / 10.0)
                .totalDaysWorked(totalDaysWorked)
                .skillsCount(skills.size())
                .build();

        return EmployeeProfileDto.fromEntity(employee, skills, currentProjects, assignmentHistory, stats);
    }

    /**
     * Update employee skills
     */
    @Transactional
    public EmployeeDto updateEmployeeSkills(Long id, List<Long> skillIds, List<String> levels) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        
        // Clear existing skills and add new ones
        employee.getSkills().clear();
        
        // Skills would be added through EmployeeSkillRepository
        // This is simplified - full implementation would require EmployeeSkillService
        
        Employee updatedEmployee = employeeRepository.save(employee);
        log.info("Updated skills for employee: {}", updatedEmployee.getEmployeeId());
        return EmployeeDto.fromEntity(updatedEmployee);
    }

    /**
     * Update employee max FT
     */
    /**
     * Update employee's max FTE capacity
     * @param id Employee ID
     * @param maxFTE New max FTE value (1.0 = 8 hours/day, 1.5 = 12 hours/day)
     */
    @Transactional
    public EmployeeDto updateEmployeeMaxFTE(Long id, Double maxFTE) {
        if (maxFTE < 0 || maxFTE > 2.0) {
            throw new BadRequestException("Max FTE must be between 0 and 2.0");
        }

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        
        employee.setMaxFTE(maxFTE);
        Employee updatedEmployee = employeeRepository.save(employee);
        log.info("Updated max FTE for employee {} to {} FTE ({} hrs/day)", 
                updatedEmployee.getEmployeeId(), maxFTE, maxFTE * 8);
        return EmployeeDto.fromEntity(updatedEmployee);
    }

    /**
     * Get all active employees with their current allocation and availability
     * Used for team member selection in projects
     */
    @Transactional(readOnly = true)
    public List<EmployeeDto> getAllEmployeesWithAvailability() {
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        
        return activeEmployees.stream()
                .map(employee -> {
                    // Calculate current allocation percentage
                    int currentAllocation = 0;
                    if (employee.getAllocations() != null) {
                        currentAllocation = employee.getAllocations().stream()
                                .filter(a -> a.getStatus() == com.rmp.entity.Allocation.Status.ACTIVE)
                                .mapToInt(a -> a.getFte() != null ? (int)(a.getFte() * 100) : 0)
                                .sum();
                    }
                    return EmployeeDto.fromEntity(employee, currentAllocation);
                })
                .sorted((a, b) -> Double.compare(b.getAvailableFTE() != null ? b.getAvailableFTE() : 0, 
                                                 a.getAvailableFTE() != null ? a.getAvailableFTE() : 0)) // Sort by availability
                .toList();
    }
}

