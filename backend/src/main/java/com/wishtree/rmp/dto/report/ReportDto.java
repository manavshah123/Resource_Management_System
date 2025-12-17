package com.wishtree.rmp.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ReportDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeUtilizationReport {
        private LocalDateTime generatedAt;
        private LocalDate periodStart;
        private LocalDate periodEnd;
        private int totalEmployees;
        private int allocatedEmployees;
        private int benchEmployees;
        private int overallocatedEmployees;
        private double averageUtilization;
        private List<EmployeeUtilizationRow> employees;
        private Map<String, Double> departmentUtilization;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeUtilizationRow {
        private String employeeId;
        private String name;
        private String department;
        private String designation;
        private double currentFTE;
        private double maxFTE;
        private double utilizationPercentage;
        private int activeProjects;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BenchReport {
        private LocalDateTime generatedAt;
        private int totalBenchEmployees;
        private double averageBenchDays;
        private List<BenchEmployeeRow> employees;
        private Map<String, Integer> benchByDepartment;
        private Map<String, Integer> benchBySkillCategory;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BenchEmployeeRow {
        private String employeeId;
        private String name;
        private String department;
        private String designation;
        private LocalDate lastProjectEndDate;
        private int daysOnBench;
        private List<String> topSkills;
        private String availabilityStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillEvolutionReport {
        private LocalDateTime generatedAt;
        private LocalDate periodStart;
        private LocalDate periodEnd;
        private int totalSkills;
        private int newSkillsAdded;
        private int employeesWithNewSkills;
        private List<SkillGrowthRow> skillGrowth;
        private List<TopSkillRow> topSkills;
        private Map<String, Integer> skillsByCategory;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillGrowthRow {
        private String skillName;
        private String category;
        private int previousCount;
        private int currentCount;
        private int growth;
        private double growthPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopSkillRow {
        private String skillName;
        private String category;
        private int employeeCount;
        private int projectDemand;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectNeedsReport {
        private LocalDateTime generatedAt;
        private int upcomingProjects;
        private int totalResourcesNeeded;
        private List<ProjectNeedRow> projects;
        private Map<String, Integer> skillDemand;
        private List<SkillGapRow> skillGaps;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectNeedRow {
        private Long projectId;
        private String projectName;
        private String client;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private int teamSize;
        private int resourcesNeeded;
        private List<String> requiredSkills;
        private List<String> missingSkills;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillGapRow {
        private String skillName;
        private int required;
        private int available;
        private int gap;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrainingProgressReport {
        private LocalDateTime generatedAt;
        private int totalTrainings;
        private int activeTrainings;
        private int totalAssignments;
        private int completedAssignments;
        private int overdueAssignments;
        private double overallCompletionRate;
        private List<TrainingRow> trainings;
        private List<EmployeeTrainingRow> employeeProgress;
        private Map<String, Double> completionByDepartment;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrainingRow {
        private Long trainingId;
        private String title;
        private String category;
        private String difficulty;
        private int totalAssigned;
        private int completed;
        private int inProgress;
        private int overdue;
        private double completionRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeTrainingRow {
        private String employeeId;
        private String employeeName;
        private String department;
        private int totalAssigned;
        private int completed;
        private int inProgress;
        private int overdue;
        private double completionRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceReport {
        private LocalDateTime generatedAt;
        private LocalDate periodStart;
        private LocalDate periodEnd;
        private double averageQuizScore;
        private double averageTrainingCompletion;
        private int certificatesIssued;
        private List<EmployeePerformanceRow> employees;
        private Map<String, Double> performanceByDepartment;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeePerformanceRow {
        private String employeeId;
        private String name;
        private String department;
        private int quizzesTaken;
        private double averageQuizScore;
        private int trainingsCompleted;
        private int certificatesEarned;
        private int skillsAcquired;
        private double performanceScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySummaryReport {
        private LocalDateTime generatedAt;
        private LocalDate reportDate;
        
        // Employee metrics
        private int totalEmployees;
        private int newEmployeesToday;
        private int employeesOnLeave;
        
        // Project metrics
        private int activeProjects;
        private int projectsStartingToday;
        private int projectsEndingToday;
        
        // Allocation metrics
        private int allocationsCreated;
        private int allocationsEnding;
        private double overallUtilization;
        
        // Training metrics
        private int trainingsAssigned;
        private int trainingsCompleted;
        private int overdueTrainings;
        
        // Alerts
        private List<String> criticalAlerts;
        private List<String> warningAlerts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklySummaryReport {
        private LocalDateTime generatedAt;
        private LocalDate weekStart;
        private LocalDate weekEnd;
        
        // Employee trends
        private int totalEmployees;
        private int newEmployees;
        private int employeesLeft;
        private double utilizationChange;
        
        // Project trends
        private int projectsStarted;
        private int projectsCompleted;
        private int projectsDelayed;
        
        // Skill trends
        private int newSkillsAdded;
        private List<String> trendingSkills;
        
        // Training metrics
        private int trainingsCompleted;
        private int certificatesIssued;
        private double avgTrainingScore;
        
        // Highlights
        private List<String> topPerformers;
        private List<String> attentionNeeded;
    }
}


