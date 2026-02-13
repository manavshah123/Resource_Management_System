package com.rmp.service.report;

import com.rmp.dto.report.ReportDto.*;
import com.rmp.entity.*;
import com.rmp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportDataService {

    private final EmployeeRepository employeeRepository;
    private final AllocationRepository allocationRepository;
    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final TrainingRepository trainingRepository;
    private final TrainingAssignmentRepository trainingAssignmentRepository;
    private final CertificateRepository certificateRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public EmployeeUtilizationReport generateEmployeeUtilizationReport(LocalDate startDate, LocalDate endDate) {
        log.info("Generating Employee Utilization Report for period {} to {}", startDate, endDate);
        
        List<Employee> employees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        List<EmployeeUtilizationRow> rows = new ArrayList<>();
        Map<String, List<Double>> deptUtilizations = new HashMap<>();
        
        int allocatedCount = 0;
        int benchCount = 0;
        int overallocatedCount = 0;
        double totalUtilization = 0;
        
        for (Employee emp : employees) {
            List<Allocation> allocations = allocationRepository.findByEmployeeAndActiveInPeriod(
                    emp.getId(), startDate, endDate);
            
            double totalFTE = allocations.stream()
                    .filter(a -> "ACTIVE".equals(a.getStatus()))
                    .mapToDouble(Allocation::getFte)
                    .sum();
            
            double utilizationPct = (totalFTE / emp.getMaxFTE()) * 100;
            totalUtilization += utilizationPct;
            
            String status;
            if (totalFTE == 0) {
                status = "BENCH";
                benchCount++;
            } else if (totalFTE > emp.getMaxFTE()) {
                status = "OVER_ALLOCATED";
                overallocatedCount++;
                allocatedCount++;
            } else {
                status = "ALLOCATED";
                allocatedCount++;
            }
            
            rows.add(EmployeeUtilizationRow.builder()
                    .employeeId(emp.getEmployeeId())
                    .name(emp.getName())
                    .department(emp.getDepartment())
                    .designation(emp.getDesignation())
                    .currentFTE(totalFTE)
                    .maxFTE(emp.getMaxFTE())
                    .utilizationPercentage(Math.min(utilizationPct, 100))
                    .activeProjects(allocations.size())
                    .status(status)
                    .build());
            
            deptUtilizations.computeIfAbsent(emp.getDepartment(), k -> new ArrayList<>())
                    .add(utilizationPct);
        }
        
        Map<String, Double> departmentUtilization = deptUtilizations.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> e.getValue().stream().mapToDouble(d -> d).average().orElse(0)
                ));
        
        return EmployeeUtilizationReport.builder()
                .generatedAt(LocalDateTime.now())
                .periodStart(startDate)
                .periodEnd(endDate)
                .totalEmployees(employees.size())
                .allocatedEmployees(allocatedCount)
                .benchEmployees(benchCount)
                .overallocatedEmployees(overallocatedCount)
                .averageUtilization(employees.isEmpty() ? 0 : totalUtilization / employees.size())
                .employees(rows)
                .departmentUtilization(departmentUtilization)
                .build();
    }

    public BenchReport generateBenchReport() {
        log.info("Generating Bench Report");
        
        List<Employee> employees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        List<BenchEmployeeRow> benchEmployees = new ArrayList<>();
        Map<String, Integer> benchByDepartment = new HashMap<>();
        Map<String, Integer> benchBySkillCategory = new HashMap<>();
        
        LocalDate today = LocalDate.now();
        
        for (Employee emp : employees) {
            List<Allocation> activeAllocations = allocationRepository.findByEmployeeAndActiveInPeriod(
                    emp.getId(), today, today);
            
            double totalFTE = activeAllocations.stream()
                    .filter(a -> "ACTIVE".equals(a.getStatus()))
                    .mapToDouble(Allocation::getFte)
                    .sum();
            
            if (totalFTE == 0) {
                // Find last project end date
                LocalDate lastProjectEnd = allocationRepository.findLastAllocationEndDateByEmployee(emp.getId())
                        .orElse(emp.getJoinDate());
                
                int daysOnBench = (int) ChronoUnit.DAYS.between(lastProjectEnd, today);
                
                List<String> topSkills = employeeSkillRepository.findByEmployeeId(emp.getId()).stream()
                        .filter(EmployeeSkill::isPrimary)
                        .map(es -> es.getSkill().getName())
                        .limit(3)
                        .collect(Collectors.toList());
                
                benchEmployees.add(BenchEmployeeRow.builder()
                        .employeeId(emp.getEmployeeId())
                        .name(emp.getName())
                        .department(emp.getDepartment())
                        .designation(emp.getDesignation())
                        .lastProjectEndDate(lastProjectEnd)
                        .daysOnBench(Math.max(daysOnBench, 0))
                        .topSkills(topSkills)
                        .availabilityStatus(emp.getAvailabilityStatus() != null ? emp.getAvailabilityStatus().name() : "UNKNOWN")
                        .build());
                
                benchByDepartment.merge(emp.getDepartment(), 1, Integer::sum);
                
                // Count by skill category
                employeeSkillRepository.findByEmployeeId(emp.getId()).stream()
                        .map(es -> es.getSkill().getCategory())
                        .distinct()
                        .forEach(category -> benchBySkillCategory.merge(category, 1, Integer::sum));
            }
        }
        
        double avgBenchDays = benchEmployees.stream()
                .mapToInt(BenchEmployeeRow::getDaysOnBench)
                .average()
                .orElse(0);
        
        return BenchReport.builder()
                .generatedAt(LocalDateTime.now())
                .totalBenchEmployees(benchEmployees.size())
                .averageBenchDays(avgBenchDays)
                .employees(benchEmployees)
                .benchByDepartment(benchByDepartment)
                .benchBySkillCategory(benchBySkillCategory)
                .build();
    }

    public SkillEvolutionReport generateSkillEvolutionReport(LocalDate startDate, LocalDate endDate) {
        log.info("Generating Skill Evolution Report for period {} to {}", startDate, endDate);
        
        List<Skill> skills = skillRepository.findAll();
        List<SkillGrowthRow> skillGrowth = new ArrayList<>();
        List<TopSkillRow> topSkills = new ArrayList<>();
        Map<String, Integer> skillsByCategory = new HashMap<>();
        
        int newSkillsAdded = 0;
        Set<Long> employeesWithNewSkills = new HashSet<>();
        
        for (Skill skill : skills) {
            List<EmployeeSkill> allEmployeeSkills = employeeSkillRepository.findBySkillId(skill.getId());
            int currentCount = allEmployeeSkills.size();
            
            // Count by category
            skillsByCategory.merge(skill.getCategory(), currentCount, Integer::sum);
            
            // Estimate previous count (simplified - in real app would use audit logs)
            int previousCount = (int) (currentCount * 0.9); // Placeholder
            int growth = currentCount - previousCount;
            double growthPct = previousCount > 0 ? (growth * 100.0 / previousCount) : 0;
            
            if (growth > 0) {
                skillGrowth.add(SkillGrowthRow.builder()
                        .skillName(skill.getName())
                        .category(skill.getCategory())
                        .previousCount(previousCount)
                        .currentCount(currentCount)
                        .growth(growth)
                        .growthPercentage(growthPct)
                        .build());
            }
            
            // Count project demand
            int projectDemand = projectRepository.countByRequiredSkill(skill.getId());
            
            topSkills.add(TopSkillRow.builder()
                    .skillName(skill.getName())
                    .category(skill.getCategory())
                    .employeeCount(currentCount)
                    .projectDemand(projectDemand)
                    .build());
        }
        
        // Sort top skills by employee count
        topSkills.sort((a, b) -> Integer.compare(b.getEmployeeCount(), a.getEmployeeCount()));
        
        return SkillEvolutionReport.builder()
                .generatedAt(LocalDateTime.now())
                .periodStart(startDate)
                .periodEnd(endDate)
                .totalSkills(skills.size())
                .newSkillsAdded(newSkillsAdded)
                .employeesWithNewSkills(employeesWithNewSkills.size())
                .skillGrowth(skillGrowth)
                .topSkills(topSkills.subList(0, Math.min(10, topSkills.size())))
                .skillsByCategory(skillsByCategory)
                .build();
    }

    public ProjectNeedsReport generateProjectNeedsReport() {
        log.info("Generating Project Needs Report");
        
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusMonths(3);
        
        List<Project> upcomingProjects = projectRepository.findUpcomingProjects(today, futureDate);
        List<ProjectNeedRow> projectNeeds = new ArrayList<>();
        Map<String, Integer> skillDemand = new HashMap<>();
        Map<String, SkillGapRow> skillGaps = new HashMap<>();
        
        int totalResourcesNeeded = 0;
        
        for (Project project : upcomingProjects) {
            List<Allocation> allocations = allocationRepository.findByProjectId(project.getId());
            int currentTeamSize = allocations.size();
            
            // Calculate resources needed (simplified)
            int resourcesNeeded = Math.max(0, 5 - currentTeamSize); // Placeholder - assumes 5 needed per project
            totalResourcesNeeded += resourcesNeeded;
            
            // Get required skills from the ManyToMany relationship
            List<String> requiredSkills = project.getRequiredSkills().stream()
                    .map(Skill::getName)
                    .collect(Collectors.toList());
            
            // Find missing skills
            Set<Long> teamSkillIds = allocations.stream()
                    .flatMap(a -> employeeSkillRepository.findByEmployeeId(a.getEmployee().getId()).stream())
                    .map(es -> es.getSkill().getId())
                    .collect(Collectors.toSet());
            
            List<String> missingSkills = project.getRequiredSkills().stream()
                    .filter(skill -> !teamSkillIds.contains(skill.getId()))
                    .map(Skill::getName)
                    .collect(Collectors.toList());
            
            // Update skill demand
            for (String skill : requiredSkills) {
                skillDemand.merge(skill, 1, Integer::sum);
            }
            
            projectNeeds.add(ProjectNeedRow.builder()
                    .projectId(project.getId())
                    .projectName(project.getName())
                    .client(project.getClient())
                    .startDate(project.getStartDate())
                    .endDate(project.getEndDate())
                    .status(project.getStatus().name())
                    .teamSize(currentTeamSize)
                    .resourcesNeeded(resourcesNeeded)
                    .requiredSkills(requiredSkills)
                    .missingSkills(missingSkills)
                    .build());
        }
        
        // Calculate skill gaps
        List<SkillGapRow> gapList = skillDemand.entrySet().stream()
                .map(entry -> {
                    String skillName = entry.getKey();
                    int required = entry.getValue();
                    int available = (int) employeeSkillRepository.countBySkillName(skillName);
                    return SkillGapRow.builder()
                            .skillName(skillName)
                            .required(required)
                            .available(available)
                            .gap(Math.max(0, required - available))
                            .build();
                })
                .filter(gap -> gap.getGap() > 0)
                .sorted((a, b) -> Integer.compare(b.getGap(), a.getGap()))
                .collect(Collectors.toList());
        
        return ProjectNeedsReport.builder()
                .generatedAt(LocalDateTime.now())
                .upcomingProjects(upcomingProjects.size())
                .totalResourcesNeeded(totalResourcesNeeded)
                .projects(projectNeeds)
                .skillDemand(skillDemand)
                .skillGaps(gapList)
                .build();
    }

    public TrainingProgressReport generateTrainingProgressReport() {
        log.info("Generating Training Progress Report");
        
        List<Training> trainings = trainingRepository.findAll();
        List<TrainingRow> trainingRows = new ArrayList<>();
        List<EmployeeTrainingRow> employeeRows = new ArrayList<>();
        Map<String, Double> completionByDepartment = new HashMap<>();
        
        int totalAssignments = 0;
        int completedAssignments = 0;
        int overdueAssignments = 0;
        
        LocalDate today = LocalDate.now();
        
        for (Training training : trainings) {
            List<TrainingAssignment> assignments = trainingAssignmentRepository.findByTrainingId(training.getId());
            int assigned = assignments.size();
            int completed = (int) assignments.stream().filter(a -> TrainingAssignment.Status.COMPLETED.equals(a.getStatus())).count();
            int inProgress = (int) assignments.stream().filter(a -> TrainingAssignment.Status.IN_PROGRESS.equals(a.getStatus())).count();
            int overdue = (int) assignments.stream()
                    .filter(a -> !TrainingAssignment.Status.COMPLETED.equals(a.getStatus()) && a.getDueDate() != null && a.getDueDate().isBefore(today))
                    .count();
            
            totalAssignments += assigned;
            completedAssignments += completed;
            overdueAssignments += overdue;
            
            double completionRate = assigned > 0 ? (completed * 100.0 / assigned) : 0;
            
            trainingRows.add(TrainingRow.builder()
                    .trainingId(training.getId())
                    .title(training.getTitle())
                    .category(training.getCategory() != null ? training.getCategory().name() : "UNKNOWN")
                    .difficulty(training.getDifficulty() != null ? training.getDifficulty().name() : "UNKNOWN")
                    .totalAssigned(assigned)
                    .completed(completed)
                    .inProgress(inProgress)
                    .overdue(overdue)
                    .completionRate(completionRate)
                    .build());
        }
        
        // Employee training progress
        List<Employee> employees = employeeRepository.findAll();
        Map<String, List<Double>> deptCompletions = new HashMap<>();
        
        for (Employee emp : employees) {
            List<TrainingAssignment> empAssignments = trainingAssignmentRepository.findByEmployeeId(emp.getId());
            if (empAssignments.isEmpty()) continue;
            
            int assigned = empAssignments.size();
            int completed = (int) empAssignments.stream().filter(a -> TrainingAssignment.Status.COMPLETED.equals(a.getStatus())).count();
            int inProgress = (int) empAssignments.stream().filter(a -> TrainingAssignment.Status.IN_PROGRESS.equals(a.getStatus())).count();
            int overdue = (int) empAssignments.stream()
                    .filter(a -> !TrainingAssignment.Status.COMPLETED.equals(a.getStatus()) && a.getDueDate() != null && a.getDueDate().isBefore(today))
                    .count();
            
            double completionRate = assigned > 0 ? (completed * 100.0 / assigned) : 0;
            
            employeeRows.add(EmployeeTrainingRow.builder()
                    .employeeId(emp.getEmployeeId())
                    .employeeName(emp.getName())
                    .department(emp.getDepartment())
                    .totalAssigned(assigned)
                    .completed(completed)
                    .inProgress(inProgress)
                    .overdue(overdue)
                    .completionRate(completionRate)
                    .build());
            
            deptCompletions.computeIfAbsent(emp.getDepartment(), k -> new ArrayList<>())
                    .add(completionRate);
        }
        
        completionByDepartment = deptCompletions.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> e.getValue().stream().mapToDouble(d -> d).average().orElse(0)
                ));
        
        double overallCompletionRate = totalAssignments > 0 ? (completedAssignments * 100.0 / totalAssignments) : 0;
        
        return TrainingProgressReport.builder()
                .generatedAt(LocalDateTime.now())
                .totalTrainings(trainings.size())
                .activeTrainings((int) trainings.stream().filter(t -> Training.Status.ACTIVE.equals(t.getStatus())).count())
                .totalAssignments(totalAssignments)
                .completedAssignments(completedAssignments)
                .overdueAssignments(overdueAssignments)
                .overallCompletionRate(overallCompletionRate)
                .trainings(trainingRows)
                .employeeProgress(employeeRows)
                .completionByDepartment(completionByDepartment)
                .build();
    }

    public PerformanceReport generatePerformanceReport(LocalDate startDate, LocalDate endDate) {
        log.info("Generating Performance Report for period {} to {}", startDate, endDate);
        
        List<Employee> employees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        List<EmployeePerformanceRow> performanceRows = new ArrayList<>();
        Map<String, List<Double>> deptPerformance = new HashMap<>();
        
        double totalQuizScore = 0;
        int quizCount = 0;
        int certificatesIssued = 0;
        
        for (Employee emp : employees) {
            List<QuizAttempt> quizAttempts = quizAttemptRepository.findByEmployeeIdAndPeriod(
                    emp.getId(), startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
            
            int quizzesTaken = quizAttempts.size();
            double avgQuizScore = quizAttempts.stream()
                    .filter(qa -> qa.getScorePercentage() != null)
                    .mapToDouble(QuizAttempt::getScorePercentage)
                    .average()
                    .orElse(0);
            
            List<TrainingAssignment> completedTrainings = trainingAssignmentRepository.findByEmployeeIdAndStatus(
                    emp.getId(), TrainingAssignment.Status.COMPLETED);
            int trainingsCompleted = completedTrainings.size();
            
            List<Certificate> certificates = certificateRepository.findByEmployeeId(emp.getId());
            int certsEarned = (int) certificates.stream()
                    .filter(c -> c.getIssuedDate() != null && 
                            !c.getIssuedDate().isBefore(startDate) && 
                            !c.getIssuedDate().isAfter(endDate))
                    .count();
            certificatesIssued += certsEarned;
            
            int skillsAcquired = employeeSkillRepository.findByEmployeeId(emp.getId()).size();
            
            // Calculate performance score (weighted average)
            double performanceScore = (avgQuizScore * 0.4) + (trainingsCompleted * 5) + (certsEarned * 10) + (skillsAcquired * 2);
            performanceScore = Math.min(100, performanceScore);
            
            if (quizzesTaken > 0) {
                totalQuizScore += avgQuizScore;
                quizCount++;
            }
            
            performanceRows.add(EmployeePerformanceRow.builder()
                    .employeeId(emp.getEmployeeId())
                    .name(emp.getName())
                    .department(emp.getDepartment())
                    .quizzesTaken(quizzesTaken)
                    .averageQuizScore(avgQuizScore)
                    .trainingsCompleted(trainingsCompleted)
                    .certificatesEarned(certsEarned)
                    .skillsAcquired(skillsAcquired)
                    .performanceScore(performanceScore)
                    .build());
            
            deptPerformance.computeIfAbsent(emp.getDepartment(), k -> new ArrayList<>())
                    .add(performanceScore);
        }
        
        // Sort by performance score
        performanceRows.sort((a, b) -> Double.compare(b.getPerformanceScore(), a.getPerformanceScore()));
        
        Map<String, Double> performanceByDepartment = deptPerformance.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> e.getValue().stream().mapToDouble(d -> d).average().orElse(0)
                ));
        
        return PerformanceReport.builder()
                .generatedAt(LocalDateTime.now())
                .periodStart(startDate)
                .periodEnd(endDate)
                .averageQuizScore(quizCount > 0 ? totalQuizScore / quizCount : 0)
                .averageTrainingCompletion(0) // Can be calculated from training data
                .certificatesIssued(certificatesIssued)
                .employees(performanceRows)
                .performanceByDepartment(performanceByDepartment)
                .build();
    }

    public DailySummaryReport generateDailySummaryReport() {
        log.info("Generating Daily Summary Report");
        
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);
        
        List<Employee> allEmployees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        List<Project> activeProjects = projectRepository.findByStatus(Project.Status.IN_PROGRESS);
        List<Allocation> allActiveAllocations = allocationRepository.findActiveAllocations(today);
        
        // Employee metrics
        int newEmployeesToday = (int) allEmployees.stream()
                .filter(e -> e.getCreatedAt() != null && e.getCreatedAt().toLocalDate().equals(today))
                .count();
        
        int onLeave = (int) allEmployees.stream()
                .filter(e -> Employee.AvailabilityStatus.ON_LEAVE.equals(e.getAvailabilityStatus()))
                .count();
        
        // Project metrics
        int projectsStartingToday = (int) activeProjects.stream()
                .filter(p -> today.equals(p.getStartDate()))
                .count();
        
        int projectsEndingToday = (int) activeProjects.stream()
                .filter(p -> today.equals(p.getEndDate()))
                .count();
        
        // Allocation metrics
        double totalFTE = allActiveAllocations.stream().mapToDouble(Allocation::getFte).sum();
        double maxFTE = allEmployees.stream().mapToDouble(Employee::getMaxFTE).sum();
        double overallUtilization = maxFTE > 0 ? (totalFTE / maxFTE) * 100 : 0;
        
        int allocationsEnding = (int) allActiveAllocations.stream()
                .filter(a -> a.getEndDate() != null && a.getEndDate().isBefore(today.plusDays(7)))
                .count();
        
        // Training metrics
        List<TrainingAssignment> overdueTrainings = trainingAssignmentRepository.findOverdueAssignments(today);
        int trainingsCompleted = (int) trainingAssignmentRepository.countCompletedToday(today);
        
        // Alerts
        List<String> criticalAlerts = new ArrayList<>();
        List<String> warningAlerts = new ArrayList<>();
        
        if (overallUtilization < 50) {
            criticalAlerts.add("Overall utilization below 50% (" + String.format("%.1f%%", overallUtilization) + ")");
        }
        
        if (overdueTrainings.size() > 10) {
            criticalAlerts.add(overdueTrainings.size() + " overdue training assignments");
        }
        
        if (allocationsEnding > 5) {
            warningAlerts.add(allocationsEnding + " allocations ending within 7 days");
        }
        
        if (projectsEndingToday > 0) {
            warningAlerts.add(projectsEndingToday + " project(s) ending today");
        }
        
        return DailySummaryReport.builder()
                .generatedAt(LocalDateTime.now())
                .reportDate(today)
                .totalEmployees(allEmployees.size())
                .newEmployeesToday(newEmployeesToday)
                .employeesOnLeave(onLeave)
                .activeProjects(activeProjects.size())
                .projectsStartingToday(projectsStartingToday)
                .projectsEndingToday(projectsEndingToday)
                .allocationsCreated(0) // Would need audit logging
                .allocationsEnding(allocationsEnding)
                .overallUtilization(overallUtilization)
                .trainingsAssigned(0) // Would need audit logging
                .trainingsCompleted(trainingsCompleted)
                .overdueTrainings(overdueTrainings.size())
                .criticalAlerts(criticalAlerts)
                .warningAlerts(warningAlerts)
                .build();
    }

    public WeeklySummaryReport generateWeeklySummaryReport() {
        log.info("Generating Weekly Summary Report");
        
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        LocalDate weekEnd = today;
        
        List<Employee> allEmployees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        List<Project> allProjects = projectRepository.findAll();
        
        // Employee trends
        int newEmployees = (int) allEmployees.stream()
                .filter(e -> e.getCreatedAt() != null && 
                        !e.getCreatedAt().toLocalDate().isBefore(weekStart) &&
                        !e.getCreatedAt().toLocalDate().isAfter(weekEnd))
                .count();
        
        // Project trends
        int projectsStarted = (int) allProjects.stream()
                .filter(p -> p.getStartDate() != null &&
                        !p.getStartDate().isBefore(weekStart) &&
                        !p.getStartDate().isAfter(weekEnd))
                .count();
        
        int projectsCompleted = (int) allProjects.stream()
                .filter(p -> Project.Status.COMPLETED.equals(p.getStatus()) &&
                        p.getEndDate() != null &&
                        !p.getEndDate().isBefore(weekStart) &&
                        !p.getEndDate().isAfter(weekEnd))
                .count();
        
        // Training metrics
        int trainingsCompleted = (int) trainingAssignmentRepository.countCompletedInPeriod(weekStart, weekEnd);
        int certificatesIssued = (int) certificateRepository.countIssuedInPeriod(weekStart, weekEnd);
        
        // Quiz score
        double avgTrainingScore = quizAttemptRepository.getAverageScoreInPeriod(
                weekStart.atStartOfDay(), weekEnd.atTime(23, 59, 59));
        
        // Top performers
        List<String> topPerformers = new ArrayList<>();
        List<String> attentionNeeded = new ArrayList<>();
        
        // Trending skills (most used in new projects)
        List<String> trendingSkills = skillRepository.findTrendingSkills(5);
        
        return WeeklySummaryReport.builder()
                .generatedAt(LocalDateTime.now())
                .weekStart(weekStart)
                .weekEnd(weekEnd)
                .totalEmployees(allEmployees.size())
                .newEmployees(newEmployees)
                .employeesLeft(0) // Would need tracking
                .utilizationChange(0) // Would need comparison
                .projectsStarted(projectsStarted)
                .projectsCompleted(projectsCompleted)
                .projectsDelayed(0) // Would need tracking
                .newSkillsAdded(0) // Would need audit logging
                .trendingSkills(trendingSkills)
                .trainingsCompleted(trainingsCompleted)
                .certificatesIssued(certificatesIssued)
                .avgTrainingScore(avgTrainingScore)
                .topPerformers(topPerformers)
                .attentionNeeded(attentionNeeded)
                .build();
    }
}

