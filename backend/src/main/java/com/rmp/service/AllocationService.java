package com.rmp.service;

import com.rmp.dto.AllocationCreateDto;
import com.rmp.dto.AllocationDto;
import com.rmp.entity.Allocation;
import com.rmp.entity.Employee;
import com.rmp.entity.Project;
import com.rmp.entity.Skill;
import com.rmp.exceptions.BadRequestException;
import com.rmp.exceptions.ResourceNotFoundException;
import com.rmp.repository.AllocationRepository;
import com.rmp.repository.EmployeeRepository;
import com.rmp.repository.ProjectRepository;
import com.rmp.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AllocationService {

    private final AllocationRepository allocationRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;

    public Page<AllocationDto> getAllAllocations(Pageable pageable) {
        return allocationRepository.findAll(pageable).map(AllocationDto::fromEntity);
    }

    public AllocationDto getAllocationById(Long id) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation not found with id: " + id));
        return AllocationDto.fromEntity(allocation);
    }

    public List<AllocationDto> getAllocationsByEmployee(Long employeeId) {
        return allocationRepository.findByEmployeeId(employeeId)
                .stream()
                .map(AllocationDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<AllocationDto> getAllocationsByProject(Long projectId) {
        return allocationRepository.findByProjectId(projectId)
                .stream()
                .map(AllocationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AllocationDto createAllocation(AllocationCreateDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Convert percentage to FTE if FTE not provided
        Double requestedFTE = dto.getFte() != null ? dto.getFte() : 
                (dto.getAllocationPercentage() != null ? dto.getAllocationPercentage() / 100.0 : 0.0);
        
        // Check for over-allocation
        Double currentFTE = allocationRepository.getEmployeeFTEForPeriod(
                dto.getEmployeeId(), dto.getStartDate(), dto.getEndDate());
        if (currentFTE == null) currentFTE = 0.0;
        
        Double maxFTE = employee.getMaxFTE() != null ? employee.getMaxFTE() : 1.0;
        
        if (currentFTE + requestedFTE > maxFTE) {
            throw new BadRequestException(
                    String.format("Employee would be over-allocated. Current: %.2f FTE, Requested: %.2f FTE, Max: %.2f FTE",
                            currentFTE, requestedFTE, maxFTE));
        }

        // Fetch assigned skills
        Set<Skill> assignedSkills = new HashSet<>();
        if (dto.getAssignedSkillIds() != null && !dto.getAssignedSkillIds().isEmpty()) {
            assignedSkills = new HashSet<>(skillRepository.findAllById(dto.getAssignedSkillIds()));
        }

        Allocation allocation = Allocation.builder()
                .employee(employee)
                .project(project)
                .fte(requestedFTE)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .role(dto.getRole())
                .billable(dto.isBillable())
                .notes(dto.getNotes())
                .status(Allocation.Status.ACTIVE)
                .assignedSkills(assignedSkills)
                .build();

        Allocation savedAllocation = allocationRepository.save(allocation);
        log.info("Created allocation: {} -> {} ({} FTE = {} hrs/day) with {} skills", 
                employee.getName(), project.getName(), requestedFTE, requestedFTE * 8, assignedSkills.size());
        return AllocationDto.fromEntity(savedAllocation);
    }

    @Transactional
    public AllocationDto updateAllocation(Long id, AllocationCreateDto dto) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation not found with id: " + id));

        // Convert percentage to FTE if FTE not provided
        Double requestedFTE = dto.getFte() != null ? dto.getFte() : 
                (dto.getAllocationPercentage() != null ? dto.getAllocationPercentage() / 100.0 : allocation.getFte());
        
        allocation.setFte(requestedFTE);
        allocation.setStartDate(dto.getStartDate());
        allocation.setEndDate(dto.getEndDate());
        allocation.setRole(dto.getRole());
        allocation.setBillable(dto.isBillable());
        allocation.setNotes(dto.getNotes());

        // Update assigned skills
        if (dto.getAssignedSkillIds() != null) {
            Set<Skill> assignedSkills = new HashSet<>(skillRepository.findAllById(dto.getAssignedSkillIds()));
            allocation.setAssignedSkills(assignedSkills);
        }

        Allocation updatedAllocation = allocationRepository.save(allocation);
        log.info("Updated allocation: {} with {} skills", id, allocation.getAssignedSkills().size());
        return AllocationDto.fromEntity(updatedAllocation);
    }

    @Transactional
    public void deleteAllocation(Long id) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation not found with id: " + id));
        allocationRepository.delete(allocation);
        log.info("Deleted allocation: {}", id);
    }

    public Integer checkAvailability(Long employeeId, LocalDate startDate, LocalDate endDate) {
        Integer currentAllocation = allocationRepository.getEmployeeAllocationForPeriod(
                employeeId, startDate, endDate);
        return 100 - currentAllocation;
    }

    public List<AllocationDto> getUpcomingDeallocations(int days) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(days);
        return allocationRepository.findAllocationsEndingBetween(startDate, endDate)
                .stream()
                .map(AllocationDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<Long> getOverallocatedEmployeeIds() {
        return allocationRepository.findOverallocatedEmployees()
                .stream()
                .map(arr -> (Long) arr[0])
                .collect(Collectors.toList());
    }

    public long getTotalCount() {
        return allocationRepository.count();
    }

    public long getActiveCount() {
        return allocationRepository.countActiveAllocations();
    }

    public long getUniqueAllocatedEmployeesCount() {
        return allocationRepository.countUniqueAllocatedEmployees();
    }
}

