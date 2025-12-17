package com.rmp.scheduler;

import com.rmp.dto.report.ReportDto.*;
import com.rmp.service.EmailService;
import com.rmp.service.report.ExcelExportService;
import com.rmp.service.report.PdfExportService;
import com.rmp.service.report.ReportDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class WeeklyReportJob implements Job {

    private final ReportDataService reportDataService;
    private final PdfExportService pdfExportService;
    private final ExcelExportService excelExportService;
    private final EmailService emailService;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        log.info("Starting Weekly Report Job execution...");
        
        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(6);
            
            // Generate weekly summary report
            WeeklySummaryReport weeklyReport = reportDataService.generateWeeklySummaryReport();
            byte[] weeklyPdf = pdfExportService.generateWeeklySummaryReport(weeklyReport);
            
            // Generate comprehensive utilization report
            EmployeeUtilizationReport utilizationReport = reportDataService.generateEmployeeUtilizationReport(startDate, endDate);
            byte[] utilizationExcel = excelExportService.generateEmployeeUtilizationReport(utilizationReport);
            
            // Generate training progress report
            TrainingProgressReport trainingReport = reportDataService.generateTrainingProgressReport();
            byte[] trainingExcel = excelExportService.generateTrainingProgressReport(trainingReport);
            
            // Send weekly report email with all attachments
            emailService.sendWeeklyReportEmail(weeklyPdf, utilizationExcel);
            
            log.info("Weekly Report Job completed successfully");
        } catch (Exception e) {
            log.error("Error executing Weekly Report Job: {}", e.getMessage(), e);
            throw new JobExecutionException("Failed to execute weekly report job", e);
        }
    }
}


