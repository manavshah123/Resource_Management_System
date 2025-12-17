package com.wishtree.rmp.scheduler;

import com.wishtree.rmp.dto.report.ReportDto.DailySummaryReport;
import com.wishtree.rmp.service.EmailService;
import com.wishtree.rmp.service.report.PdfExportService;
import com.wishtree.rmp.service.report.ReportDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DailyReportJob implements Job {

    private final ReportDataService reportDataService;
    private final PdfExportService pdfExportService;
    private final EmailService emailService;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        log.info("Starting Daily Report Job execution...");
        
        try {
            // Generate daily summary report data
            DailySummaryReport report = reportDataService.generateDailySummaryReport();
            
            // Generate PDF
            byte[] pdfReport = pdfExportService.generateDailySummaryReport(report);
            
            // Send email to admins
            emailService.sendDailySummaryEmail(pdfReport);
            
            log.info("Daily Report Job completed successfully");
        } catch (Exception e) {
            log.error("Error executing Daily Report Job: {}", e.getMessage(), e);
            throw new JobExecutionException("Failed to execute daily report job", e);
        }
    }
}


