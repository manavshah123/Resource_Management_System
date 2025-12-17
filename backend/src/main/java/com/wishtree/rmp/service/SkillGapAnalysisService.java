package com.wishtree.rmp.service;

import com.wishtree.rmp.dto.SkillGapDto.*;
import com.wishtree.rmp.entity.*;
import com.wishtree.rmp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SkillGapAnalysisService {

    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final AllocationRepository allocationRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final TrainingRepository trainingRepository;

    /**
     * Get skill gap analysis for all active projects
     */
    public List<SkillGapAnalysis> getProjectSkillGaps() {
        List<Project> activeProjects = projectRepository.findActiveProjects();
        return activeProjects.stream()
                .map(this::analyzeProjectSkillGap)
                .sorted((a, b) -> Double.compare(b.getGapScore(), a.getGapScore()))
                .collect(Collectors.toList());
    }

    /**
     * Get skill gap analysis for a specific project
     */
    public SkillGapAnalysis getProjectSkillGap(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return analyzeProjectSkillGap(project);
    }

    private SkillGapAnalysis analyzeProjectSkillGap(Project project) {
        // Get project team
        List<Allocation> allocations = allocationRepository.findByProjectId(project.getId()).stream()
                .filter(a -> a.getStatus() == Allocation.Status.ACTIVE)
                .collect(Collectors.toList());

        Set<Long> teamMemberIds = allocations.stream()
                .map(a -> a.getEmployee().getId())
                .collect(Collectors.toSet());

        List<String> teamMembers = allocations.stream()
                .map(a -> a.getEmployee().getName())
                .collect(Collectors.toList());

        // Get team skills
        Set<Long> teamSkillIds = new HashSet<>();
        Map<Long, List<Employee>> skillToEmployees = new HashMap<>();
        
        for (Allocation alloc : allocations) {
            List<EmployeeSkill> empSkills = employeeSkillRepository.findByEmployeeId(alloc.getEmployee().getId());
            for (EmployeeSkill es : empSkills) {
                teamSkillIds.add(es.getSkill().getId());
                skillToEmployees.computeIfAbsent(es.getSkill().getId(), k -> new ArrayList<>())
                        .add(alloc.getEmployee());
            }
        }

        // Get required skills
        Set<Skill> requiredSkills = project.getRequiredSkills();
        int requiredCount = requiredSkills.size();
        
        // Calculate gaps
        List<SkillGapDetail> skillGaps = new ArrayList<>();
        int coveredCount = 0;
        int missingCount = 0;

        for (Skill skill : requiredSkills) {
            boolean isCovered = teamSkillIds.contains(skill.getId());
            int availableInTeam = skillToEmployees.getOrDefault(skill.getId(), Collections.emptyList()).size();
            
            // Get potential assignees (available employees with this skill)
            List<EmployeeWithSkill> potentialAssignees = getAvailableEmployeesWithSkill(skill.getId(), teamMemberIds);
            
            String gapStatus;
            if (availableInTeam >= 1) {
                gapStatus = "COVERED";
                coveredCount++;
            } else if (!potentialAssignees.isEmpty()) {
                gapStatus = "PARTIAL";
            } else {
                gapStatus = "MISSING";
                missingCount++;
            }

            skillGaps.add(SkillGapDetail.builder()
                    .skillId(skill.getId())
                    .skillName(skill.getName())
                    .category(skill.getCategory())
                    .required(1)
                    .available(availableInTeam)
                    .gap(availableInTeam >= 1 ? 0 : 1)
                    .gapStatus(gapStatus)
                    .employeesWithSkill(potentialAssignees)
                    .build());
        }

        // Calculate gap score (0-100)
        double gapScore = requiredCount > 0 ? ((double) missingCount / requiredCount) * 100 : 0;
        
        // Determine severity
        String severity;
        if (gapScore >= 50) severity = "CRITICAL";
        else if (gapScore >= 30) severity = "HIGH";
        else if (gapScore >= 10) severity = "MEDIUM";
        else severity = "LOW";

        return SkillGapAnalysis.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .clientName(project.getClient())
                .status(project.getStatus().name())
                .teamSize(allocations.size())
                .requiredSkillsCount(requiredCount)
                .coveredSkillsCount(coveredCount)
                .missingSkillsCount(missingCount)
                .gapScore(Math.round(gapScore * 10) / 10.0)
                .gapSeverity(severity)
                .skillGaps(skillGaps)
                .teamMembers(teamMembers)
                .build();
    }

    private List<EmployeeWithSkill> getAvailableEmployeesWithSkill(Long skillId, Set<Long> excludeIds) {
        List<EmployeeSkill> employeeSkills = employeeSkillRepository.findBySkillId(skillId);
        
        return employeeSkills.stream()
                .filter(es -> !excludeIds.contains(es.getEmployee().getId()))
                .filter(es -> es.getEmployee().getStatus() == Employee.Status.ACTIVE)
                .map(es -> {
                    Employee emp = es.getEmployee();
                    Double totalFTE = allocationRepository.getEmployeeTotalFTE(emp.getId());
                    double currentFTE = totalFTE != null ? totalFTE : 0;
                    double maxFTE = emp.getMaxFTE() != null ? emp.getMaxFTE() : 1.0;
                    double availableFTE = maxFTE - currentFTE;
                    
                    return EmployeeWithSkill.builder()
                            .employeeId(emp.getId())
                            .employeeId_code(emp.getEmployeeId())
                            .name(emp.getName())
                            .department(emp.getDepartment())
                            .skillLevel(es.getLevel().name())
                            .currentFTE(currentFTE)
                            .availableFTE(Math.max(0, availableFTE))
                            .isAvailable(availableFTE > 0)
                            .build();
                })
                .sorted((a, b) -> Double.compare(b.getAvailableFTE(), a.getAvailableFTE()))
                .collect(Collectors.toList());
    }

    /**
     * Get team skill matrix for a project
     */
    public TeamGapMatrix getTeamGapMatrix(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        List<Allocation> allocations = allocationRepository.findByProjectId(projectId).stream()
                .filter(a -> a.getStatus() == Allocation.Status.ACTIVE)
                .collect(Collectors.toList());

        Set<Skill> requiredSkills = project.getRequiredSkills();
        List<String> skillNames = requiredSkills.stream()
                .map(Skill::getName)
                .sorted()
                .collect(Collectors.toList());

        Map<String, Integer> skillCoverage = new HashMap<>();
        skillNames.forEach(s -> skillCoverage.put(s, 0));

        List<TeamMemberSkillRow> teamRows = new ArrayList<>();

        for (Allocation alloc : allocations) {
            Employee emp = alloc.getEmployee();
            Set<Long> empSkillIds = employeeSkillRepository.findByEmployeeId(emp.getId()).stream()
                    .map(es -> es.getSkill().getId())
                    .collect(Collectors.toSet());

            Map<String, Boolean> skillMatrix = new LinkedHashMap<>();
            int covered = 0;

            for (Skill skill : requiredSkills) {
                boolean hasSkill = empSkillIds.contains(skill.getId());
                skillMatrix.put(skill.getName(), hasSkill);
                if (hasSkill) {
                    covered++;
                    skillCoverage.merge(skill.getName(), 1, Integer::sum);
                }
            }

            teamRows.add(TeamMemberSkillRow.builder()
                    .employeeId(emp.getId())
                    .employeeName(emp.getName())
                    .role(alloc.getRole())
                    .fte(alloc.getFte())
                    .skillMatrix(skillMatrix)
                    .coveredSkillsCount(covered)
                    .build());
        }

        return TeamGapMatrix.builder()
                .projectId(projectId)
                .projectName(project.getName())
                .requiredSkills(skillNames)
                .teamMembers(teamRows)
                .skillCoverage(skillCoverage)
                .build();
    }

    /**
     * Get skill gap summary across organization
     */
    public SkillGapSummary getSkillGapSummary() {
        List<SkillGapAnalysis> allGaps = getProjectSkillGaps();
        
        int totalProjects = allGaps.size();
        int projectsWithGaps = (int) allGaps.stream().filter(g -> g.getMissingSkillsCount() > 0).count();
        int critical = (int) allGaps.stream().filter(g -> "CRITICAL".equals(g.getGapSeverity())).count();
        int high = (int) allGaps.stream().filter(g -> "HIGH".equals(g.getGapSeverity())).count();
        int medium = (int) allGaps.stream().filter(g -> "MEDIUM".equals(g.getGapSeverity())).count();
        int low = (int) allGaps.stream().filter(g -> "LOW".equals(g.getGapSeverity())).count();
        
        double avgScore = allGaps.stream()
                .mapToDouble(SkillGapAnalysis::getGapScore)
                .average()
                .orElse(0);

        // Calculate skill demand vs supply
        List<SkillDemandSupply> topSkillGaps = calculateSkillDemandSupply();

        // Gaps by category
        Map<String, Integer> gapsByCategory = new HashMap<>();
        for (SkillGapAnalysis analysis : allGaps) {
            for (SkillGapDetail gap : analysis.getSkillGaps()) {
                if ("MISSING".equals(gap.getGapStatus())) {
                    gapsByCategory.merge(gap.getCategory(), 1, Integer::sum);
                }
            }
        }

        return SkillGapSummary.builder()
                .totalProjects(totalProjects)
                .projectsWithGaps(projectsWithGaps)
                .criticalGaps(critical)
                .highGaps(high)
                .mediumGaps(medium)
                .lowGaps(low)
                .averageGapScore(Math.round(avgScore * 10) / 10.0)
                .topSkillGaps(topSkillGaps)
                .gapsByCategory(gapsByCategory)
                .build();
    }

    private List<SkillDemandSupply> calculateSkillDemandSupply() {
        // Get all required skills from active projects
        List<Project> activeProjects = projectRepository.findActiveProjects();
        Map<Long, Integer> skillDemand = new HashMap<>();
        
        for (Project project : activeProjects) {
            for (Skill skill : project.getRequiredSkills()) {
                skillDemand.merge(skill.getId(), 1, Integer::sum);
            }
        }

        // Get skill supply (available employees)
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        Map<Long, Set<Long>> skillToEmployees = new HashMap<>();
        
        for (Employee emp : activeEmployees) {
            Double totalFTE = allocationRepository.getEmployeeTotalFTE(emp.getId());
            double currentFTE = totalFTE != null ? totalFTE : 0;
            double maxFTE = emp.getMaxFTE() != null ? emp.getMaxFTE() : 1.0;
            
            if (currentFTE < maxFTE) { // Has availability
                for (EmployeeSkill es : emp.getSkills()) {
                    skillToEmployees.computeIfAbsent(es.getSkill().getId(), k -> new HashSet<>())
                            .add(emp.getId());
                }
            }
        }

        List<SkillDemandSupply> result = new ArrayList<>();
        List<Skill> skills = skillRepository.findAll();
        
        for (Skill skill : skills) {
            int demand = skillDemand.getOrDefault(skill.getId(), 0);
            int supply = skillToEmployees.getOrDefault(skill.getId(), Collections.emptySet()).size();
            int gap = demand - supply;
            
            if (demand > 0) {
                result.add(SkillDemandSupply.builder()
                        .skillId(skill.getId())
                        .skillName(skill.getName())
                        .category(skill.getCategory())
                        .demand(demand)
                        .supply(supply)
                        .gap(Math.max(0, gap))
                        .gapPercentage(demand > 0 ? Math.round((double) Math.max(0, gap) / demand * 100 * 10) / 10.0 : 0)
                        .build());
            }
        }

        return result.stream()
                .sorted((a, b) -> Integer.compare(b.getGap(), a.getGap()))
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * Get skill heatmap data (departments x skills)
     */
    public SkillHeatmapData getSkillHeatmap() {
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        
        // Get all departments and skills
        Set<String> departments = activeEmployees.stream()
                .map(Employee::getDepartment)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(TreeSet::new));
        
        List<Skill> skills = skillRepository.findAll();
        List<String> skillNames = skills.stream()
                .map(Skill::getName)
                .sorted()
                .collect(Collectors.toList());

        // Build matrix
        Map<String, Map<String, Integer>> detailedMatrix = new LinkedHashMap<>();
        for (String dept : departments) {
            Map<String, Integer> deptSkills = new LinkedHashMap<>();
            skillNames.forEach(s -> deptSkills.put(s, 0));
            detailedMatrix.put(dept, deptSkills);
        }

        // Fill matrix
        for (Employee emp : activeEmployees) {
            String dept = emp.getDepartment();
            if (dept == null) continue;
            
            for (EmployeeSkill es : emp.getSkills()) {
                String skillName = es.getSkill().getName();
                detailedMatrix.get(dept).merge(skillName, 1, Integer::sum);
            }
        }

        // Convert to array format for heatmap
        List<List<Integer>> matrix = new ArrayList<>();
        for (String dept : departments) {
            List<Integer> row = new ArrayList<>();
            for (String skill : skillNames) {
                row.add(detailedMatrix.get(dept).get(skill));
            }
            matrix.add(row);
        }

        return SkillHeatmapData.builder()
                .skills(skillNames)
                .departments(new ArrayList<>(departments))
                .matrix(matrix)
                .detailedMatrix(detailedMatrix)
                .build();
    }

    /**
     * Get AI-based training recommendations for skill gaps
     */
    public List<TrainingRecommendation> getTrainingRecommendations() {
        List<TrainingRecommendation> recommendations = new ArrayList<>();
        List<SkillGapAnalysis> projectGaps = getProjectSkillGaps();
        
        // Get all trainings
        List<Training> trainings = trainingRepository.findAll();
        Map<Long, List<Training>> skillToTrainings = new HashMap<>();
        
        for (Training training : trainings) {
            if (training.getStatus() != Training.Status.ACTIVE) continue;
            for (Skill skill : training.getRelatedSkills()) {
                skillToTrainings.computeIfAbsent(skill.getId(), k -> new ArrayList<>())
                        .add(training);
            }
        }

        // For each project with gaps, recommend training for team members
        for (SkillGapAnalysis analysis : projectGaps) {
            if (analysis.getMissingSkillsCount() == 0) continue;

            for (SkillGapDetail gap : analysis.getSkillGaps()) {
                if (!"MISSING".equals(gap.getGapStatus())) continue;
                
                // Find team members who could learn this skill
                List<Allocation> allocations = allocationRepository.findByProjectId(analysis.getProjectId());
                
                for (Allocation alloc : allocations) {
                    Employee emp = alloc.getEmployee();
                    
                    // Check if employee already has this skill
                    boolean hasSkill = employeeSkillRepository.findByEmployeeId(emp.getId()).stream()
                            .anyMatch(es -> es.getSkill().getId().equals(gap.getSkillId()));
                    
                    if (!hasSkill) {
                        List<Training> relevantTrainings = skillToTrainings.getOrDefault(gap.getSkillId(), Collections.emptyList());
                        
                        List<SuggestedTraining> suggestions = relevantTrainings.stream()
                                .map(t -> SuggestedTraining.builder()
                                        .trainingId(t.getId())
                                        .title(t.getTitle())
                                        .category(t.getCategory().name())
                                        .difficulty(t.getDifficulty().name())
                                        .durationHours(t.getDurationHours() != null ? t.getDurationHours() : 0)
                                        .relevanceScore(calculateRelevanceScore(t, gap.getSkillId()))
                                        .build())
                                .sorted((a, b) -> Double.compare(b.getRelevanceScore(), a.getRelevanceScore()))
                                .limit(3)
                                .collect(Collectors.toList());

                        if (!suggestions.isEmpty()) {
                            recommendations.add(TrainingRecommendation.builder()
                                    .employeeId(emp.getId())
                                    .employeeName(emp.getName())
                                    .department(emp.getDepartment())
                                    .skillId(gap.getSkillId())
                                    .skillName(gap.getSkillName())
                                    .skillCategory(gap.getCategory())
                                    .reason("Required for project: " + analysis.getProjectName())
                                    .priority(calculatePriority(analysis.getGapSeverity()))
                                    .suggestedTrainings(suggestions)
                                    .build());
                        }
                    }
                }
            }
        }

        return recommendations.stream()
                .sorted((a, b) -> Integer.compare(b.getPriority(), a.getPriority()))
                .collect(Collectors.toList());
    }

    private double calculateRelevanceScore(Training training, Long skillId) {
        // Base score
        double score = 50.0;
        
        // Primary skill match
        boolean isPrimarySkill = training.getRelatedSkills().stream()
                .anyMatch(s -> s.getId().equals(skillId));
        if (isPrimarySkill) score += 30;
        
        // Difficulty bonus (intermediate and advanced are more comprehensive)
        if (training.getDifficulty() == Training.Difficulty.INTERMEDIATE) score += 10;
        if (training.getDifficulty() == Training.Difficulty.ADVANCED) score += 15;
        
        // Duration bonus (longer = more thorough)
        if (training.getDurationHours() != null && training.getDurationHours() > 10) score += 5;
        
        return Math.min(100, score);
    }

    private int calculatePriority(String severity) {
        return switch (severity) {
            case "CRITICAL" -> 5;
            case "HIGH" -> 4;
            case "MEDIUM" -> 3;
            case "LOW" -> 2;
            default -> 1;
        };
    }
}

