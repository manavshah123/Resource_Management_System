package com.rmp.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@rmp.com}")
    private String fromEmail;

    @Value("${app.admin.emails:admin@rmp.com}")
    private String adminEmails;

    @Value("${app.name:Resource Management Portal}")
    private String appName;

    @Async
    public void sendReportEmail(String to, String subject, String body, Map<String, byte[]> attachments) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            
            if (attachments != null) {
                for (Map.Entry<String, byte[]> attachment : attachments.entrySet()) {
                    helper.addAttachment(attachment.getKey(), new ByteArrayResource(attachment.getValue()));
                }
            }
            
            mailSender.send(message);
            log.info("Report email sent successfully to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send report email to {}: {}", to, e.getMessage());
        }
    }

    public void sendDailySummaryEmail(byte[] pdfReport) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String subject = String.format("[%s] Daily Summary Report - %s", appName, today);
        
        String body = buildDailySummaryEmailBody(today);
        
        Map<String, byte[]> attachments = Map.of(
                "Daily_Summary_" + today + ".pdf", pdfReport
        );
        
        for (String email : adminEmails.split(",")) {
            sendReportEmail(email.trim(), subject, body, attachments);
        }
    }

    public void sendWeeklyReportEmail(byte[] pdfReport, byte[] excelReport) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String weekStart = LocalDate.now().minusDays(6).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String subject = String.format("[%s] Weekly Report - %s to %s", appName, weekStart, today);
        
        String body = buildWeeklyReportEmailBody(weekStart, today);
        
        Map<String, byte[]> attachments = Map.of(
                "Weekly_Report_" + today + ".pdf", pdfReport,
                "Weekly_Report_" + today + ".xlsx", excelReport
        );
        
        for (String email : adminEmails.split(",")) {
            sendReportEmail(email.trim(), subject, body, attachments);
        }
    }

    public void sendUtilizationReportEmail(List<String> recipients, byte[] pdfReport, byte[] excelReport) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String subject = String.format("[%s] Employee Utilization Report - %s", appName, today);
        
        String body = buildUtilizationReportEmailBody(today);
        
        Map<String, byte[]> attachments = Map.of(
                "Utilization_Report_" + today + ".pdf", pdfReport,
                "Utilization_Report_" + today + ".xlsx", excelReport
        );
        
        for (String email : recipients) {
            sendReportEmail(email.trim(), subject, body, attachments);
        }
    }

    public void sendBenchReportEmail(List<String> recipients, byte[] pdfReport, byte[] excelReport) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String subject = String.format("[%s] Bench Report - %s", appName, today);
        
        String body = buildBenchReportEmailBody(today);
        
        Map<String, byte[]> attachments = Map.of(
                "Bench_Report_" + today + ".pdf", pdfReport,
                "Bench_Report_" + today + ".xlsx", excelReport
        );
        
        for (String email : recipients) {
            sendReportEmail(email.trim(), subject, body, attachments);
        }
    }

    public void sendTrainingProgressReportEmail(List<String> recipients, byte[] pdfReport, byte[] excelReport) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String subject = String.format("[%s] Training Progress Report - %s", appName, today);
        
        String body = buildTrainingReportEmailBody(today);
        
        Map<String, byte[]> attachments = Map.of(
                "Training_Progress_" + today + ".pdf", pdfReport,
                "Training_Progress_" + today + ".xlsx", excelReport
        );
        
        for (String email : recipients) {
            sendReportEmail(email.trim(), subject, body, attachments);
        }
    }

    private String buildDailySummaryEmailBody(String date) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; }
                    .footer { padding: 15px; background: #1e293b; color: #94a3b8; font-size: 12px; border-radius: 0 0 8px 8px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>🏢 Daily Summary Report</h2>
                    <p>%s</p>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Please find attached the daily summary report for the Resource Management Portal.</p>
                    <p>This report includes:</p>
                    <ul>
                        <li>Employee metrics and status</li>
                        <li>Active project overview</li>
                        <li>Resource allocation status</li>
                        <li>Training progress updates</li>
                        <li>Critical alerts and warnings</li>
                    </ul>
                    <p>Please review the attached PDF for detailed information.</p>
                </div>
                <div class="footer">
                    <p>This is an automated email from %s. Please do not reply.</p>
                </div>
            </body>
            </html>
            """.formatted(date, appName);
    }

    private String buildWeeklyReportEmailBody(String weekStart, String weekEnd) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; }
                    .footer { padding: 15px; background: #1e293b; color: #94a3b8; font-size: 12px; border-radius: 0 0 8px 8px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>📊 Weekly Summary Report</h2>
                    <p>%s to %s</p>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Please find attached the weekly summary report for the Resource Management Portal.</p>
                    <p>This report includes:</p>
                    <ul>
                        <li>Employee trends and utilization changes</li>
                        <li>Project progress and milestones</li>
                        <li>Skill evolution and trends</li>
                        <li>Training completion metrics</li>
                        <li>Performance highlights</li>
                    </ul>
                    <p>Attachments:</p>
                    <ul>
                        <li><strong>PDF Report</strong> - Visual summary with charts</li>
                        <li><strong>Excel Report</strong> - Detailed data for analysis</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>This is an automated email from %s. Please do not reply.</p>
                </div>
            </body>
            </html>
            """.formatted(weekStart, weekEnd, appName);
    }

    private String buildUtilizationReportEmailBody(String date) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .header { background: linear-gradient(135deg, #22c55e, #3b82f6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; }
                    .footer { padding: 15px; background: #1e293b; color: #94a3b8; font-size: 12px; border-radius: 0 0 8px 8px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>👥 Employee Utilization Report</h2>
                    <p>%s</p>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Please find attached the employee utilization report showing resource allocation status.</p>
                    <p>Key metrics include:</p>
                    <ul>
                        <li>Individual employee FTE allocation</li>
                        <li>Utilization percentages</li>
                        <li>Department-wise breakdown</li>
                        <li>Over-allocated resources</li>
                        <li>Bench status</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>This is an automated email from %s. Please do not reply.</p>
                </div>
            </body>
            </html>
            """.formatted(date, appName);
    }

    private String buildBenchReportEmailBody(String date) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .header { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; }
                    .footer { padding: 15px; background: #1e293b; color: #94a3b8; font-size: 12px; border-radius: 0 0 8px 8px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>📋 Bench Report</h2>
                    <p>%s</p>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Please find attached the bench report showing employees currently without project allocation.</p>
                    <p>Key information:</p>
                    <ul>
                        <li>Employees on bench</li>
                        <li>Duration on bench</li>
                        <li>Available skills</li>
                        <li>Department breakdown</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>This is an automated email from %s. Please do not reply.</p>
                </div>
            </body>
            </html>
            """.formatted(date, appName);
    }

    private String buildTrainingReportEmailBody(String date) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .header { background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; }
                    .footer { padding: 15px; background: #1e293b; color: #94a3b8; font-size: 12px; border-radius: 0 0 8px 8px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>📚 Training Progress Report</h2>
                    <p>%s</p>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Please find attached the training progress report.</p>
                    <p>This report covers:</p>
                    <ul>
                        <li>Training completion rates</li>
                        <li>Individual employee progress</li>
                        <li>Overdue assignments</li>
                        <li>Department-wise completion</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>This is an automated email from %s. Please do not reply.</p>
                </div>
            </body>
            </html>
            """.formatted(date, appName);
    }
}


