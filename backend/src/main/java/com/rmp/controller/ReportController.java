package com.rmp.controller;

import com.rmp.dto.report.ReportDto.*;
import com.rmp.service.report.ExcelExportService;
import com.rmp.service.report.PdfExportService;
import com.rmp.service.report.ReportDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reports", description = "Report generation and export APIs")
public class ReportController {

    private final ReportDataService reportDataService;
    private final PdfExportService pdfExportService;
    private final ExcelExportService excelExportService;

    private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // ==================== EMPLOYEE UTILIZATION REPORT ====================

    @GetMapping("/utilization")
    @Operation(summary = "Get employee utilization report data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EmployeeUtilizationReport> getUtilizationReport(
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Generating utilization report for period {} to {}", startDate, endDate);
        EmployeeUtilizationReport report = reportDataService.generateEmployeeUtilizationReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/utilization/pdf")
    @Operation(summary = "Download employee utilization report as PDF")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadUtilizationPdf(
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) throws IOException {
        
        log.info("Generating utilization PDF report for period {} to {}", startDate, endDate);
        EmployeeUtilizationReport report = reportDataService.generateEmployeeUtilizationReport(startDate, endDate);
        byte[] pdf = pdfExportService.generateEmployeeUtilizationReport(report);
        
        String filename = "Utilization_Report_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".pdf";
        return createPdfResponse(pdf, filename);
    }

    @GetMapping("/utilization/excel")
    @Operation(summary = "Download employee utilization report as Excel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadUtilizationExcel(
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) throws IOException {
        
        log.info("Generating utilization Excel report for period {} to {}", startDate, endDate);
        EmployeeUtilizationReport report = reportDataService.generateEmployeeUtilizationReport(startDate, endDate);
        byte[] excel = excelExportService.generateEmployeeUtilizationReport(report);
        
        String filename = "Utilization_Report_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".xlsx";
        return createExcelResponse(excel, filename);
    }

    // ==================== BENCH REPORT ====================

    @GetMapping("/bench")
    @Operation(summary = "Get bench report data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BenchReport> getBenchReport() {
        log.info("Generating bench report");
        BenchReport report = reportDataService.generateBenchReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/bench/pdf")
    @Operation(summary = "Download bench report as PDF")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadBenchPdf() throws IOException {
        log.info("Generating bench PDF report");
        BenchReport report = reportDataService.generateBenchReport();
        byte[] pdf = pdfExportService.generateBenchReport(report);
        
        String filename = "Bench_Report_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".pdf";
        return createPdfResponse(pdf, filename);
    }

    @GetMapping("/bench/excel")
    @Operation(summary = "Download bench report as Excel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadBenchExcel() throws IOException {
        log.info("Generating bench Excel report");
        BenchReport report = reportDataService.generateBenchReport();
        byte[] excel = excelExportService.generateBenchReport(report);
        
        String filename = "Bench_Report_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".xlsx";
        return createExcelResponse(excel, filename);
    }

    // ==================== SKILL EVOLUTION REPORT ====================

    @GetMapping("/skill-evolution")
    @Operation(summary = "Get skill evolution report data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SkillEvolutionReport> getSkillEvolutionReport(
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Generating skill evolution report for period {} to {}", startDate, endDate);
        SkillEvolutionReport report = reportDataService.generateSkillEvolutionReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/skill-evolution/excel")
    @Operation(summary = "Download skill evolution report as Excel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadSkillEvolutionExcel(
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) throws IOException {
        
        log.info("Generating skill evolution Excel report");
        SkillEvolutionReport report = reportDataService.generateSkillEvolutionReport(startDate, endDate);
        byte[] excel = excelExportService.generateSkillEvolutionReport(report);
        
        String filename = "Skill_Evolution_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".xlsx";
        return createExcelResponse(excel, filename);
    }

    // ==================== PROJECT NEEDS REPORT ====================

    @GetMapping("/project-needs")
    @Operation(summary = "Get upcoming project needs report data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectNeedsReport> getProjectNeedsReport() {
        log.info("Generating project needs report");
        ProjectNeedsReport report = reportDataService.generateProjectNeedsReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/project-needs/excel")
    @Operation(summary = "Download project needs report as Excel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadProjectNeedsExcel() throws IOException {
        log.info("Generating project needs Excel report");
        ProjectNeedsReport report = reportDataService.generateProjectNeedsReport();
        byte[] excel = excelExportService.generateProjectNeedsReport(report);
        
        String filename = "Project_Needs_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".xlsx";
        return createExcelResponse(excel, filename);
    }

    // ==================== TRAINING PROGRESS REPORT ====================

    @GetMapping("/training-progress")
    @Operation(summary = "Get training progress report data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TrainingProgressReport> getTrainingProgressReport() {
        log.info("Generating training progress report");
        TrainingProgressReport report = reportDataService.generateTrainingProgressReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/training-progress/pdf")
    @Operation(summary = "Download training progress report as PDF")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadTrainingProgressPdf() throws IOException {
        log.info("Generating training progress PDF report");
        TrainingProgressReport report = reportDataService.generateTrainingProgressReport();
        byte[] pdf = pdfExportService.generateTrainingProgressReport(report);
        
        String filename = "Training_Progress_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".pdf";
        return createPdfResponse(pdf, filename);
    }

    @GetMapping("/training-progress/excel")
    @Operation(summary = "Download training progress report as Excel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadTrainingProgressExcel() throws IOException {
        log.info("Generating training progress Excel report");
        TrainingProgressReport report = reportDataService.generateTrainingProgressReport();
        byte[] excel = excelExportService.generateTrainingProgressReport(report);
        
        String filename = "Training_Progress_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".xlsx";
        return createExcelResponse(excel, filename);
    }

    // ==================== PERFORMANCE REPORT ====================

    @GetMapping("/performance")
    @Operation(summary = "Get performance scores report data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PerformanceReport> getPerformanceReport(
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Generating performance report for period {} to {}", startDate, endDate);
        PerformanceReport report = reportDataService.generatePerformanceReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/performance/excel")
    @Operation(summary = "Download performance report as Excel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadPerformanceExcel(
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) throws IOException {
        
        log.info("Generating performance Excel report");
        PerformanceReport report = reportDataService.generatePerformanceReport(startDate, endDate);
        byte[] excel = excelExportService.generatePerformanceReport(report);
        
        String filename = "Performance_Report_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".xlsx";
        return createExcelResponse(excel, filename);
    }

    // ==================== DAILY SUMMARY REPORT ====================

    @GetMapping("/daily-summary")
    @Operation(summary = "Get daily summary report data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DailySummaryReport> getDailySummaryReport() {
        log.info("Generating daily summary report");
        DailySummaryReport report = reportDataService.generateDailySummaryReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/daily-summary/pdf")
    @Operation(summary = "Download daily summary report as PDF")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadDailySummaryPdf() throws IOException {
        log.info("Generating daily summary PDF report");
        DailySummaryReport report = reportDataService.generateDailySummaryReport();
        byte[] pdf = pdfExportService.generateDailySummaryReport(report);
        
        String filename = "Daily_Summary_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".pdf";
        return createPdfResponse(pdf, filename);
    }

    // ==================== WEEKLY SUMMARY REPORT ====================

    @GetMapping("/weekly-summary")
    @Operation(summary = "Get weekly summary report data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WeeklySummaryReport> getWeeklySummaryReport() {
        log.info("Generating weekly summary report");
        WeeklySummaryReport report = reportDataService.generateWeeklySummaryReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/weekly-summary/pdf")
    @Operation(summary = "Download weekly summary report as PDF")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadWeeklySummaryPdf() throws IOException {
        log.info("Generating weekly summary PDF report");
        WeeklySummaryReport report = reportDataService.generateWeeklySummaryReport();
        byte[] pdf = pdfExportService.generateWeeklySummaryReport(report);
        
        String filename = "Weekly_Summary_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".pdf";
        return createPdfResponse(pdf, filename);
    }

    // ==================== HELPER METHODS ====================

    private ResponseEntity<byte[]> createPdfResponse(byte[] data, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(data.length);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(data);
    }

    private ResponseEntity<byte[]> createExcelResponse(byte[] data, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(data.length);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(data);
    }
}

