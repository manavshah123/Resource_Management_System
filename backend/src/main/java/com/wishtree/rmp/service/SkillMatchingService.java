package com.wishtree.rmp.service;

import com.wishtree.rmp.dto.EmployeeDto;
import com.wishtree.rmp.entity.Employee;
import com.wishtree.rmp.entity.EmployeeSkill;
import com.wishtree.rmp.entity.Project;
import com.wishtree.rmp.entity.Skill;
import com.wishtree.rmp.exceptions.ResourceNotFoundException;
import com.wishtree.rmp.repository.EmployeeRepository;
import com.wishtree.rmp.repository.EmployeeSkillRepository;
import com.wishtree.rmp.repository.ProjectRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AI-powered skill matching service that finds the best employees
 * for a project based on required skills and availability.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SkillMatchingService {

    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final AllocationService allocationService;

    /**
     * Find matching employees for a project based on required skills.
     * Uses a scoring algorithm that considers:
     * - Skill match percentage
     * - Skill proficiency level
     * - Current availability
     * - Years of experience
     */
    public List<MatchResult> findMatchingEmployees(Long projectId) {
        Project project = projectRepository.findByIdWithSkills(projectId);
        if (project == null) {
            throw new ResourceNotFoundException("Project not found with id: " + projectId);
        }

        Set<Skill> requiredSkills = project.getRequiredSkills();
        if (requiredSkills.isEmpty()) {
            log.info("No required skills defined for project: {}", project.getName());
            return Collections.emptyList();
        }

        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        List<MatchResult> results = new ArrayList<>();

        for (Employee employee : activeEmployees) {
            MatchResult result = calculateMatchScore(employee, requiredSkills, project);
            if (result.getOverallScore() > 0) {
                results.add(result);
            }
        }

        // Sort by overall score descending
        results.sort((a, b) -> Double.compare(b.getOverallScore(), a.getOverallScore()));

        log.info("Found {} matching employees for project: {}", results.size(), project.getName());
        return results;
    }

    /**
     * Calculate match score for an employee against required skills.
     */
    private MatchResult calculateMatchScore(Employee employee, Set<Skill> requiredSkills, Project project) {
        List<EmployeeSkill> employeeSkills = employeeSkillRepository.findByEmployeeId(employee.getId());
        Set<Long> employeeSkillIds = employeeSkills.stream()
                .map(es -> es.getSkill().getId())
                .collect(Collectors.toSet());

        int matchedSkillsCount = 0;
        double skillProficiencyScore = 0;
        double experienceScore = 0;
        List<String> matchedSkillNames = new ArrayList<>();
        List<String> missingSkillNames = new ArrayList<>();

        for (Skill required : requiredSkills) {
            if (employeeSkillIds.contains(required.getId())) {
                matchedSkillsCount++;
                matchedSkillNames.add(required.getName());

                EmployeeSkill empSkill = employeeSkills.stream()
                        .filter(es -> es.getSkill().getId().equals(required.getId()))
                        .findFirst()
                        .orElse(null);

                if (empSkill != null) {
                    skillProficiencyScore += getLevelScore(empSkill.getLevel());
                    experienceScore += Math.min(empSkill.getYearsOfExperience(), 10) / 10.0;
                }
            } else {
                missingSkillNames.add(required.getName());
            }
        }

        // Calculate percentages
        double skillMatchPercentage = requiredSkills.isEmpty() ? 0 :
                (matchedSkillsCount * 100.0) / requiredSkills.size();

        double avgProficiency = matchedSkillsCount > 0 ?
                (skillProficiencyScore / matchedSkillsCount) * 25 : 0;

        double avgExperience = matchedSkillsCount > 0 ?
                (experienceScore / matchedSkillsCount) * 100 : 0;

        // Check availability
        Integer availability = allocationService.checkAvailability(
                employee.getId(), project.getStartDate(), project.getEndDate());

        // Calculate overall score (weighted average)
        double overallScore = (skillMatchPercentage * 0.4) +
                             (avgProficiency * 0.25) +
                             (avgExperience * 0.15) +
                             (availability * 0.2);

        return MatchResult.builder()
                .employee(EmployeeDto.fromEntity(employee))
                .skillMatchPercentage(skillMatchPercentage)
                .proficiencyScore(avgProficiency)
                .experienceScore(avgExperience)
                .availability(availability)
                .overallScore(overallScore)
                .matchedSkills(matchedSkillNames)
                .missingSkills(missingSkillNames)
                .build();
    }

    private double getLevelScore(EmployeeSkill.Level level) {
        return switch (level) {
            case EXPERT -> 4.0;
            case ADVANCED -> 3.0;
            case INTERMEDIATE -> 2.0;
            case BEGINNER -> 1.0;
        };
    }

    /**
     * Result of skill matching algorithm.
     */
    @Data
    @Builder
    @AllArgsConstructor
    public static class MatchResult {
        private EmployeeDto employee;
        private double skillMatchPercentage;
        private double proficiencyScore;
        private double experienceScore;
        private int availability;
        private double overallScore;
        private List<String> matchedSkills;
        private List<String> missingSkills;
    }
}

