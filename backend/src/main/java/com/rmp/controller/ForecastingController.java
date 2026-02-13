package com.rmp.controller;

import com.rmp.service.ForecastingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/forecasting")
@RequiredArgsConstructor
@Tag(name = "Forecasting", description = "Resource forecasting and capacity planning APIs")
@PreAuthorize("isAuthenticated()")
public class ForecastingController {

    private final ForecastingService forecastingService;

    @GetMapping("/capacity")
    @Operation(summary = "Get capacity forecast", description = "Get resource capacity forecast for the next N days")
    public ResponseEntity<Map<String, Object>> getCapacityForecast(
            @RequestParam(defaultValue = "90") int days) {
        return ResponseEntity.ok(forecastingService.getCapacityForecast(days));
    }

    @GetMapping("/utilization")
    @Operation(summary = "Get current utilization", description = "Get current resource utilization metrics")
    public ResponseEntity<Map<String, Object>> getCurrentUtilization() {
        return ResponseEntity.ok(forecastingService.calculateCurrentUtilization());
    }

    @GetMapping("/upcoming-releases")
    @Operation(summary = "Get upcoming releases", description = "Get employees becoming available soon")
    public ResponseEntity<List<Map<String, Object>>> getUpcomingReleases(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(forecastingService.getUpcomingReleases(days));
    }

    @GetMapping("/resource-gaps")
    @Operation(summary = "Identify resource gaps", description = "Identify skill gaps based on project requirements")
    public ResponseEntity<List<Map<String, Object>>> getResourceGaps() {
        return ResponseEntity.ok(forecastingService.identifyResourceGaps());
    }

    @GetMapping("/overallocated")
    @Operation(summary = "Get overallocated employees", description = "Get list of employees allocated beyond their capacity")
    public ResponseEntity<List<Map<String, Object>>> getOverallocatedEmployees() {
        return ResponseEntity.ok(forecastingService.getOverallocatedEmployees());
    }

    @GetMapping("/underutilized")
    @Operation(summary = "Get underutilized employees", description = "Get list of employees with low utilization")
    public ResponseEntity<List<Map<String, Object>>> getUnderutilizedEmployees() {
        return ResponseEntity.ok(forecastingService.getUnderutilizedEmployees());
    }

    @GetMapping("/department-utilization")
    @Operation(summary = "Get department utilization", description = "Get utilization metrics by department")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentUtilization() {
        return ResponseEntity.ok(forecastingService.getDepartmentUtilization());
    }

    @GetMapping("/skill-distribution")
    @Operation(summary = "Get skill distribution", description = "Get skill distribution across organization")
    public ResponseEntity<List<Map<String, Object>>> getSkillDistribution() {
        return ResponseEntity.ok(forecastingService.getSkillDistribution());
    }

    @GetMapping("/fte-matrix")
    @Operation(summary = "Get FTE forecast matrix", description = "Get FTE allocation forecast over time as projects end")
    public ResponseEntity<Map<String, Object>> getFTEForecastMatrix(
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(forecastingService.getFTEForecastMatrix(months));
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get revenue forecast", description = "Get revenue forecast based on project budgets")
    public ResponseEntity<Map<String, Object>> getRevenueForecast(
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(forecastingService.getRevenueForecast(months));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get forecast dashboard", description = "Get combined forecast dashboard with FTE and revenue data")
    public ResponseEntity<Map<String, Object>> getForecastDashboard(
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(forecastingService.getForecastDashboard(months));
    }
}

