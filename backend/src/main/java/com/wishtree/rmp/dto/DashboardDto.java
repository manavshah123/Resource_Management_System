package com.wishtree.rmp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {

    private Long totalEmployees;
    private Long activeEmployees;
    private Long activeProjects;
    private Long totalProjects;
    private Long allocatedResources;
    private Long activeAllocations;
    private Long benchStrength;
    private Long totalSkills;
    private Long overallocatedCount;
    private Double averageUtilization;
    private Map<String, Long> projectStatusDistribution;
    private Map<String, Long> departmentDistribution;
    private Map<String, Long> skillCategoryDistribution;
    private List<SkillDto> topSkills;
    private List<AllocationDto> upcomingDeallocations;
    private List<ActivityDto> recentActivities;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityDto {
        private String action;
        private String entity;
        private String entityName;
        private String performedBy;
        private String timestamp;
    }
}

