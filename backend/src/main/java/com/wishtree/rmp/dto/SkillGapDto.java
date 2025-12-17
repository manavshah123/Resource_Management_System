package com.wishtree.rmp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

public class SkillGapDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillGapAnalysis {
        private Long projectId;
        private String projectName;
        private String clientName;
        private String status;
        private int teamSize;
        private int requiredSkillsCount;
        private int coveredSkillsCount;
        private int missingSkillsCount;
        private double gapScore; // 0-100, higher = more gap
        private String gapSeverity; // LOW, MEDIUM, HIGH, CRITICAL
        private List<SkillGapDetail> skillGaps;
        private List<String> teamMembers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillGapDetail {
        private Long skillId;
        private String skillName;
        private String category;
        private int required; // Number of people with this skill needed
        private int available; // Number of team members with this skill
        private int gap; // required - available
        private String gapStatus; // COVERED, PARTIAL, MISSING
        private List<EmployeeWithSkill> employeesWithSkill; // Potential assignees
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeWithSkill {
        private Long employeeId;
        private String employeeId_code;
        private String name;
        private String department;
        private String skillLevel;
        private double currentFTE;
        private double availableFTE;
        private boolean isAvailable;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamGapMatrix {
        private Long projectId;
        private String projectName;
        private List<String> requiredSkills;
        private List<TeamMemberSkillRow> teamMembers;
        private Map<String, Integer> skillCoverage; // skillName -> count of team members with it
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMemberSkillRow {
        private Long employeeId;
        private String employeeName;
        private String role;
        private double fte;
        private Map<String, Boolean> skillMatrix; // skillName -> hasSkill
        private int coveredSkillsCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrainingRecommendation {
        private Long employeeId;
        private String employeeName;
        private String department;
        private Long skillId;
        private String skillName;
        private String skillCategory;
        private String reason; // Why this training is recommended
        private int priority; // 1-5, higher = more urgent
        private List<SuggestedTraining> suggestedTrainings;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuggestedTraining {
        private Long trainingId;
        private String title;
        private String category;
        private String difficulty;
        private int durationHours;
        private double relevanceScore; // How relevant this training is for the skill gap
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillGapSummary {
        private int totalProjects;
        private int projectsWithGaps;
        private int criticalGaps;
        private int highGaps;
        private int mediumGaps;
        private int lowGaps;
        private double averageGapScore;
        private List<SkillDemandSupply> topSkillGaps;
        private Map<String, Integer> gapsByCategory;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillDemandSupply {
        private Long skillId;
        private String skillName;
        private String category;
        private int demand; // Projects needing this skill
        private int supply; // Available employees with this skill
        private int gap; // demand - supply
        private double gapPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillHeatmapData {
        private List<String> skills;
        private List<String> departments;
        private List<List<Integer>> matrix; // departments x skills
        private Map<String, Map<String, Integer>> detailedMatrix; // dept -> skill -> count
    }
}


