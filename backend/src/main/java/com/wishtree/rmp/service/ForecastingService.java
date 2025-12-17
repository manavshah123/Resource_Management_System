package com.wishtree.rmp.service;

import com.wishtree.rmp.entity.*;
import com.wishtree.rmp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ForecastingService {

    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final AllocationRepository allocationRepository;
    private final SkillRepository skillRepository;

    /**
     * Get capacity forecast for the next N days
     */
    public Map<String, Object> getCapacityForecast(int days) {
        Map<String, Object> forecast = new HashMap<>();
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(days);

        // Get all active employees
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        int totalCapacity = activeEmployees.stream().mapToInt(e -> (int)((e.getMaxFTE() != null ? e.getMaxFTE() : 1.0) * 100)).sum();

        // Get allocations ending within the period
        List<Allocation> endingAllocations = allocationRepository.findAllocationsEndingBetween(today, endDate);
        
        // Calculate capacity over time
        List<Map<String, Object>> capacityTimeline = new ArrayList<>();
        for (int i = 0; i <= days; i += 7) { // Weekly intervals
            LocalDate date = today.plusDays(i);
            int allocatedOnDate = calculateAllocatedCapacity(date);
            int availableOnDate = totalCapacity - allocatedOnDate;
            
            Map<String, Object> point = new HashMap<>();
            point.put("date", date.toString());
            point.put("totalCapacity", totalCapacity);
            point.put("allocated", allocatedOnDate);
            point.put("available", availableOnDate);
            point.put("utilizationPercent", totalCapacity > 0 ? (allocatedOnDate * 100.0 / totalCapacity) : 0);
            capacityTimeline.add(point);
        }

        forecast.put("capacityTimeline", capacityTimeline);
        forecast.put("currentUtilization", calculateCurrentUtilization());
        forecast.put("upcomingReleases", getUpcomingReleases(days));
        forecast.put("resourceGaps", identifyResourceGaps());
        forecast.put("overallocatedEmployees", getOverallocatedEmployees());
        forecast.put("underutilizedEmployees", getUnderutilizedEmployees());

        return forecast;
    }

    /**
     * Calculate allocated capacity on a specific date
     */
    private int calculateAllocatedCapacity(LocalDate date) {
        List<Allocation> activeAllocations = allocationRepository.findAll().stream()
                .filter(a -> a.getStatus() == Allocation.Status.ACTIVE)
                .filter(a -> !a.getStartDate().isAfter(date) && 
                            (a.getEndDate() == null || !a.getEndDate().isBefore(date)))
                .collect(Collectors.toList());
        
        return activeAllocations.stream()
                .mapToInt(Allocation::getAllocationPercentage)
                .sum();
    }

    /**
     * Get current utilization metrics
     */
    public Map<String, Object> calculateCurrentUtilization() {
        Map<String, Object> utilization = new HashMap<>();
        
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        int totalEmployees = activeEmployees.size();
        int totalCapacity = activeEmployees.stream().mapToInt(e -> (int)((e.getMaxFTE() != null ? e.getMaxFTE() : 1.0) * 100)).sum();
        
        int allocated = 0;
        int onBench = 0;
        int overAllocated = 0;
        
        for (Employee emp : activeEmployees) {
            int empAllocation = getCurrentAllocationForEmployee(emp.getId());
            int maxFT = (int)((emp.getMaxFTE() != null ? emp.getMaxFTE() : 1.0) * 100);
            
            allocated += empAllocation;
            if (empAllocation == 0) onBench++;
            if (empAllocation > maxFT) overAllocated++;
        }
        
        utilization.put("totalEmployees", totalEmployees);
        utilization.put("totalCapacity", totalCapacity);
        utilization.put("allocatedCapacity", allocated);
        utilization.put("availableCapacity", totalCapacity - allocated);
        utilization.put("utilizationPercent", totalCapacity > 0 ? Math.round(allocated * 100.0 / totalCapacity * 10) / 10.0 : 0);
        utilization.put("benchCount", onBench);
        utilization.put("benchPercent", totalEmployees > 0 ? Math.round(onBench * 100.0 / totalEmployees * 10) / 10.0 : 0);
        utilization.put("overAllocatedCount", overAllocated);
        
        return utilization;
    }

    private int getCurrentAllocationForEmployee(Long employeeId) {
        return allocationRepository.findByEmployeeId(employeeId).stream()
                .filter(a -> a.getStatus() == Allocation.Status.ACTIVE)
                .mapToInt(Allocation::getAllocationPercentage)
                .sum();
    }

    /**
     * Get employees becoming available soon
     */
    public List<Map<String, Object>> getUpcomingReleases(int days) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(days);
        
        List<Allocation> endingAllocations = allocationRepository.findAllocationsEndingBetween(today, endDate);
        
        return endingAllocations.stream()
                .map(a -> {
                    Map<String, Object> release = new HashMap<>();
                    release.put("employeeId", a.getEmployee().getId());
                    release.put("employeeName", a.getEmployee().getName());
                    release.put("projectName", a.getProject().getName());
                    release.put("releaseDate", a.getEndDate());
                    release.put("allocationPercent", a.getAllocationPercentage());
                    release.put("daysUntilRelease", ChronoUnit.DAYS.between(today, a.getEndDate()));
                    return release;
                })
                .sorted((a, b) -> ((LocalDate) a.get("releaseDate")).compareTo((LocalDate) b.get("releaseDate")))
                .collect(Collectors.toList());
    }

    /**
     * Identify skill gaps based on project requirements
     */
    public List<Map<String, Object>> identifyResourceGaps() {
        List<Map<String, Object>> gaps = new ArrayList<>();
        
        // Get in-progress projects with required skills
        List<Project> activeProjects = projectRepository.findActiveProjects();
        
        // Get all available employee skills
        Map<Long, Integer> skillAvailability = new HashMap<>();
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        
        for (Employee emp : activeEmployees) {
            int empAllocation = getCurrentAllocationForEmployee(emp.getId());
            if (empAllocation < 100) { // Has availability
                for (EmployeeSkill es : emp.getSkills()) {
                    skillAvailability.merge(es.getSkill().getId(), 1, Integer::sum);
                }
            }
        }
        
        // Check project requirements vs availability
        for (Project project : activeProjects) {
            for (Skill skill : project.getRequiredSkills()) {
                int available = skillAvailability.getOrDefault(skill.getId(), 0);
                if (available < 2) { // Shortage threshold
                    Map<String, Object> gap = new HashMap<>();
                    gap.put("skillId", skill.getId());
                    gap.put("skillName", skill.getName());
                    gap.put("category", skill.getCategory());
                    gap.put("projectName", project.getName());
                    gap.put("availableResources", available);
                    gap.put("severity", available == 0 ? "CRITICAL" : "WARNING");
                    gaps.add(gap);
                }
            }
        }
        
        return gaps;
    }

    /**
     * Get list of overallocated employees
     */
    public List<Map<String, Object>> getOverallocatedEmployees() {
        List<Map<String, Object>> overallocated = new ArrayList<>();
        
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        
        for (Employee emp : activeEmployees) {
            int currentAllocation = getCurrentAllocationForEmployee(emp.getId());
            int maxFT = (int)((emp.getMaxFTE() != null ? emp.getMaxFTE() : 1.0) * 100);
            
            if (currentAllocation > maxFT) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("employeeId", emp.getId());
                entry.put("employeeName", emp.getName());
                entry.put("department", emp.getDepartment());
                entry.put("maxFT", maxFT);
                entry.put("currentAllocation", currentAllocation);
                entry.put("overBy", currentAllocation - maxFT);
                overallocated.add(entry);
            }
        }
        
        return overallocated;
    }

    /**
     * Get list of underutilized employees
     */
    public List<Map<String, Object>> getUnderutilizedEmployees() {
        List<Map<String, Object>> underutilized = new ArrayList<>();
        
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        
        for (Employee emp : activeEmployees) {
            int currentAllocation = getCurrentAllocationForEmployee(emp.getId());
            int maxFT = (int)((emp.getMaxFTE() != null ? emp.getMaxFTE() : 1.0) * 100);
            
            if (currentAllocation < maxFT * 0.5) { // Less than 50% utilized
                Map<String, Object> entry = new HashMap<>();
                entry.put("employeeId", emp.getId());
                entry.put("employeeName", emp.getName());
                entry.put("department", emp.getDepartment());
                entry.put("maxFT", maxFT);
                entry.put("currentAllocation", currentAllocation);
                entry.put("availableCapacity", maxFT - currentAllocation);
                entry.put("skills", emp.getSkills().stream()
                        .map(es -> es.getSkill().getName())
                        .collect(Collectors.toList()));
                underutilized.add(entry);
            }
        }
        
        return underutilized;
    }

    /**
     * Get department-wise utilization
     */
    public List<Map<String, Object>> getDepartmentUtilization() {
        List<Map<String, Object>> deptUtilization = new ArrayList<>();
        
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        
        Map<String, List<Employee>> byDept = activeEmployees.stream()
                .collect(Collectors.groupingBy(Employee::getDepartment));
        
        for (Map.Entry<String, List<Employee>> entry : byDept.entrySet()) {
            int totalCapacity = 0;
            int allocated = 0;
            
            for (Employee emp : entry.getValue()) {
                int maxFT = (int)((emp.getMaxFTE() != null ? emp.getMaxFTE() : 1.0) * 100);
                totalCapacity += maxFT;
                allocated += getCurrentAllocationForEmployee(emp.getId());
            }
            
            Map<String, Object> deptData = new HashMap<>();
            deptData.put("department", entry.getKey());
            deptData.put("employeeCount", entry.getValue().size());
            deptData.put("totalCapacity", totalCapacity);
            deptData.put("allocated", allocated);
            deptData.put("available", totalCapacity - allocated);
            deptData.put("utilizationPercent", totalCapacity > 0 ? Math.round(allocated * 100.0 / totalCapacity * 10) / 10.0 : 0);
            deptUtilization.add(deptData);
        }
        
        return deptUtilization;
    }

    /**
     * Get skill distribution across organization
     */
    public List<Map<String, Object>> getSkillDistribution() {
        List<Map<String, Object>> distribution = new ArrayList<>();
        
        List<Skill> skills = skillRepository.findAll();
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        
        for (Skill skill : skills) {
            long count = activeEmployees.stream()
                    .filter(emp -> emp.getSkills().stream()
                            .anyMatch(es -> es.getSkill().getId().equals(skill.getId())))
                    .count();
            
            if (count > 0) {
                Map<String, Object> skillData = new HashMap<>();
                skillData.put("skillId", skill.getId());
                skillData.put("skillName", skill.getName());
                skillData.put("category", skill.getCategory());
                skillData.put("employeeCount", count);
                distribution.add(skillData);
            }
        }
        
        return distribution.stream()
                .sorted((a, b) -> Long.compare((Long) b.get("employeeCount"), (Long) a.get("employeeCount")))
                .collect(Collectors.toList());
    }

    /**
     * Get FTE Forecast Matrix - Shows FTE allocation over time as projects end
     */
    public Map<String, Object> getFTEForecastMatrix(int months) {
        Map<String, Object> result = new HashMap<>();
        LocalDate today = LocalDate.now();
        
        // Get all active employees and their total FTE capacity
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.Status.ACTIVE);
        double totalFTECapacity = activeEmployees.stream()
                .mapToDouble(e -> e.getMaxFTE() != null ? e.getMaxFTE() : 1.0)
                .sum();
        
        // Get all active allocations
        List<Allocation> allAllocations = allocationRepository.findAll().stream()
                .filter(a -> a.getStatus() == Allocation.Status.ACTIVE)
                .collect(Collectors.toList());
        
        // Calculate current total allocated FTE
        double currentAllocatedFTE = allAllocations.stream()
                .mapToDouble(a -> a.getFte() != null ? a.getFte() : 0.0)
                .sum();
        
        // Build monthly forecast matrix
        List<Map<String, Object>> monthlyForecast = new ArrayList<>();
        
        for (int i = 0; i <= months; i++) {
            LocalDate forecastDate = today.plusMonths(i);
            YearMonth yearMonth = YearMonth.from(forecastDate);
            LocalDate monthEnd = yearMonth.atEndOfMonth();
            
            // Calculate allocated FTE for this month (excluding allocations that end before this month)
            double allocatedFTE = allAllocations.stream()
                    .filter(a -> a.getEndDate() == null || !a.getEndDate().isBefore(forecastDate))
                    .filter(a -> a.getStartDate() == null || !a.getStartDate().isAfter(monthEnd))
                    .mapToDouble(a -> a.getFte() != null ? a.getFte() : 0.0)
                    .sum();
            
            double availableFTE = totalFTECapacity - allocatedFTE;
            double utilizationPercent = totalFTECapacity > 0 ? (allocatedFTE / totalFTECapacity) * 100 : 0;
            
            // Count projects ending this month
            long projectsEndingThisMonth = allAllocations.stream()
                    .filter(a -> a.getEndDate() != null)
                    .filter(a -> YearMonth.from(a.getEndDate()).equals(yearMonth))
                    .map(Allocation::getProject)
                    .distinct()
                    .count();
            
            // FTE being released this month
            double fteReleasedThisMonth = allAllocations.stream()
                    .filter(a -> a.getEndDate() != null)
                    .filter(a -> YearMonth.from(a.getEndDate()).equals(yearMonth))
                    .mapToDouble(a -> a.getFte() != null ? a.getFte() : 0.0)
                    .sum();
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", yearMonth.toString());
            monthData.put("monthName", yearMonth.getMonth().toString() + " " + yearMonth.getYear());
            monthData.put("totalCapacityFTE", round(totalFTECapacity, 2));
            monthData.put("allocatedFTE", round(allocatedFTE, 2));
            monthData.put("availableFTE", round(availableFTE, 2));
            monthData.put("utilizationPercent", round(utilizationPercent, 1));
            monthData.put("projectsEnding", projectsEndingThisMonth);
            monthData.put("fteReleased", round(fteReleasedThisMonth, 2));
            monthlyForecast.add(monthData);
        }
        
        // Get detailed project-wise allocation ending info
        List<Map<String, Object>> projectEndDates = getProjectEndDatesWithFTE();
        
        result.put("currentTotalCapacityFTE", round(totalFTECapacity, 2));
        result.put("currentAllocatedFTE", round(currentAllocatedFTE, 2));
        result.put("currentAvailableFTE", round(totalFTECapacity - currentAllocatedFTE, 2));
        result.put("monthlyForecast", monthlyForecast);
        result.put("projectEndDates", projectEndDates);
        
        return result;
    }
    
    /**
     * Get project end dates with FTE impact
     */
    private List<Map<String, Object>> getProjectEndDatesWithFTE() {
        List<Project> projects = projectRepository.findActiveProjects();
        List<Map<String, Object>> projectData = new ArrayList<>();
        
        for (Project project : projects) {
            List<Allocation> projectAllocations = allocationRepository.findByProjectId(project.getId()).stream()
                    .filter(a -> a.getStatus() == Allocation.Status.ACTIVE)
                    .collect(Collectors.toList());
            
            if (!projectAllocations.isEmpty()) {
                double totalProjectFTE = projectAllocations.stream()
                        .mapToDouble(a -> a.getFte() != null ? a.getFte() : 0.0)
                        .sum();
                
                Map<String, Object> projectInfo = new HashMap<>();
                projectInfo.put("projectId", project.getId());
                projectInfo.put("projectName", project.getName());
                projectInfo.put("clientName", project.getClient());
                projectInfo.put("startDate", project.getStartDate());
                projectInfo.put("endDate", project.getEndDate());
                projectInfo.put("status", project.getStatus().name());
                projectInfo.put("allocatedFTE", round(totalProjectFTE, 2));
                projectInfo.put("teamSize", projectAllocations.size());
                projectInfo.put("budget", project.getBudget());
                projectData.add(projectInfo);
            }
        }
        
        // Sort by end date
        return projectData.stream()
                .sorted((a, b) -> {
                    LocalDate dateA = (LocalDate) a.get("endDate");
                    LocalDate dateB = (LocalDate) b.get("endDate");
                    if (dateA == null && dateB == null) return 0;
                    if (dateA == null) return 1;
                    if (dateB == null) return -1;
                    return dateA.compareTo(dateB);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get Revenue Forecast based on project budgets
     */
    public Map<String, Object> getRevenueForecast(int months) {
        Map<String, Object> result = new HashMap<>();
        LocalDate today = LocalDate.now();
        
        List<Project> allProjects = projectRepository.findAll();
        
        // Calculate current revenue metrics
        BigDecimal totalBudget = allProjects.stream()
                .filter(p -> p.getBudget() != null)
                .map(Project::getBudget)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal activeRevenue = allProjects.stream()
                .filter(p -> p.getStatus() == Project.Status.IN_PROGRESS)
                .filter(p -> p.getBudget() != null)
                .map(Project::getBudget)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal completedRevenue = allProjects.stream()
                .filter(p -> p.getStatus() == Project.Status.COMPLETED)
                .filter(p -> p.getBudget() != null)
                .map(Project::getBudget)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Monthly revenue breakdown
        List<Map<String, Object>> monthlyRevenue = new ArrayList<>();
        
        for (int i = 0; i <= months; i++) {
            LocalDate forecastDate = today.plusMonths(i);
            YearMonth yearMonth = YearMonth.from(forecastDate);
            
            // Revenue from projects active during this month
            BigDecimal monthlyActiveRevenue = allProjects.stream()
                    .filter(p -> p.getStatus() == Project.Status.IN_PROGRESS || p.getStatus() == Project.Status.NOT_STARTED)
                    .filter(p -> p.getBudget() != null)
                    .filter(p -> isProjectActiveInMonth(p, yearMonth))
                    .map(p -> calculateMonthlyRevenue(p, yearMonth))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Revenue from projects ending this month
            BigDecimal revenueEndingThisMonth = allProjects.stream()
                    .filter(p -> p.getEndDate() != null)
                    .filter(p -> YearMonth.from(p.getEndDate()).equals(yearMonth))
                    .filter(p -> p.getBudget() != null)
                    .map(Project::getBudget)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // New revenue starting this month
            BigDecimal newRevenueThisMonth = allProjects.stream()
                    .filter(p -> p.getStartDate() != null)
                    .filter(p -> YearMonth.from(p.getStartDate()).equals(yearMonth))
                    .filter(p -> p.getBudget() != null)
                    .map(Project::getBudget)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", yearMonth.toString());
            monthData.put("monthName", yearMonth.getMonth().toString() + " " + yearMonth.getYear());
            monthData.put("activeRevenue", monthlyActiveRevenue);
            monthData.put("revenueEnding", revenueEndingThisMonth);
            monthData.put("newRevenue", newRevenueThisMonth);
            monthlyRevenue.add(monthData);
        }
        
        // Project-wise revenue breakdown
        List<Map<String, Object>> projectRevenue = allProjects.stream()
                .filter(p -> p.getBudget() != null && p.getBudget().compareTo(BigDecimal.ZERO) > 0)
                .map(p -> {
                    Map<String, Object> projData = new HashMap<>();
                    projData.put("projectId", p.getId());
                    projData.put("projectName", p.getName());
                    projData.put("clientName", p.getClient());
                    projData.put("budget", p.getBudget());
                    projData.put("status", p.getStatus().name());
                    projData.put("startDate", p.getStartDate());
                    projData.put("endDate", p.getEndDate());
                    
                    // Calculate monthly rate
                    if (p.getStartDate() != null && p.getEndDate() != null) {
                        long projectMonths = ChronoUnit.MONTHS.between(p.getStartDate(), p.getEndDate()) + 1;
                        if (projectMonths > 0) {
                            BigDecimal monthlyRate = p.getBudget().divide(BigDecimal.valueOf(projectMonths), 2, RoundingMode.HALF_UP);
                            projData.put("monthlyRate", monthlyRate);
                        }
                    }
                    return projData;
                })
                .sorted((a, b) -> ((BigDecimal) b.get("budget")).compareTo((BigDecimal) a.get("budget")))
                .collect(Collectors.toList());
        
        // Revenue by status
        Map<String, BigDecimal> revenueByStatus = new HashMap<>();
        revenueByStatus.put("IN_PROGRESS", activeRevenue);
        revenueByStatus.put("COMPLETED", completedRevenue);
        revenueByStatus.put("NOT_STARTED", allProjects.stream()
                .filter(p -> p.getStatus() == Project.Status.NOT_STARTED)
                .filter(p -> p.getBudget() != null)
                .map(Project::getBudget)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        revenueByStatus.put("ON_HOLD", allProjects.stream()
                .filter(p -> p.getStatus() == Project.Status.ON_HOLD)
                .filter(p -> p.getBudget() != null)
                .map(Project::getBudget)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        
        result.put("totalBudget", totalBudget);
        result.put("activeRevenue", activeRevenue);
        result.put("completedRevenue", completedRevenue);
        result.put("monthlyForecast", monthlyRevenue);
        result.put("projectRevenue", projectRevenue);
        result.put("revenueByStatus", revenueByStatus);
        
        return result;
    }
    
    private boolean isProjectActiveInMonth(Project project, YearMonth month) {
        LocalDate monthStart = month.atDay(1);
        LocalDate monthEnd = month.atEndOfMonth();
        
        if (project.getStartDate() != null && project.getStartDate().isAfter(monthEnd)) {
            return false;
        }
        if (project.getEndDate() != null && project.getEndDate().isBefore(monthStart)) {
            return false;
        }
        return true;
    }
    
    private BigDecimal calculateMonthlyRevenue(Project project, YearMonth month) {
        if (project.getBudget() == null || project.getStartDate() == null || project.getEndDate() == null) {
            return BigDecimal.ZERO;
        }
        
        long projectMonths = ChronoUnit.MONTHS.between(project.getStartDate(), project.getEndDate()) + 1;
        if (projectMonths <= 0) {
            return project.getBudget();
        }
        
        return project.getBudget().divide(BigDecimal.valueOf(projectMonths), 2, RoundingMode.HALF_UP);
    }
    
    private double round(double value, int places) {
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }

    /**
     * Get combined forecast dashboard data
     */
    public Map<String, Object> getForecastDashboard(int months) {
        Map<String, Object> dashboard = new HashMap<>();
        
        dashboard.put("fteMatrix", getFTEForecastMatrix(months));
        dashboard.put("revenueForecast", getRevenueForecast(months));
        dashboard.put("utilization", calculateCurrentUtilization());
        dashboard.put("departmentUtilization", getDepartmentUtilization());
        dashboard.put("skillDistribution", getSkillDistribution().stream().limit(10).collect(Collectors.toList()));
        dashboard.put("resourceGaps", identifyResourceGaps());
        
        return dashboard;
    }
}

