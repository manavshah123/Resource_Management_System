package com.rmp.controller;

import com.rmp.dto.SkillGapDto.*;
import com.rmp.service.SkillGapAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/skill-gaps")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Skill Gap Analysis", description = "APIs for analyzing skill gaps and training recommendations")
public class SkillGapController {

    private final SkillGapAnalysisService skillGapAnalysisService;

    @GetMapping
    @Operation(summary = "Get skill gap analysis for all active projects")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SkillGapAnalysis>> getAllProjectSkillGaps() {
        log.info("Fetching skill gap analysis for all projects");
        return ResponseEntity.ok(skillGapAnalysisService.getProjectSkillGaps());
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get skill gap analysis for a specific project")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SkillGapAnalysis> getProjectSkillGap(@PathVariable Long projectId) {
        log.info("Fetching skill gap analysis for project: {}", projectId);
        return ResponseEntity.ok(skillGapAnalysisService.getProjectSkillGap(projectId));
    }

    @GetMapping("/project/{projectId}/matrix")
    @Operation(summary = "Get team skill matrix for a project")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TeamGapMatrix> getTeamGapMatrix(@PathVariable Long projectId) {
        log.info("Fetching team gap matrix for project: {}", projectId);
        return ResponseEntity.ok(skillGapAnalysisService.getTeamGapMatrix(projectId));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get organization-wide skill gap summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SkillGapSummary> getSkillGapSummary() {
        log.info("Fetching skill gap summary");
        return ResponseEntity.ok(skillGapAnalysisService.getSkillGapSummary());
    }

    @GetMapping("/heatmap")
    @Operation(summary = "Get skill heatmap data (departments x skills)")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SkillHeatmapData> getSkillHeatmap() {
        log.info("Fetching skill heatmap data");
        return ResponseEntity.ok(skillGapAnalysisService.getSkillHeatmap());
    }

    @GetMapping("/recommendations")
    @Operation(summary = "Get AI-based training recommendations for skill gaps")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TrainingRecommendation>> getTrainingRecommendations() {
        log.info("Fetching training recommendations");
        return ResponseEntity.ok(skillGapAnalysisService.getTrainingRecommendations());
    }
}


