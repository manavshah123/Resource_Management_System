package com.wishtree.rmp.service.report;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.wishtree.rmp.dto.report.ReportDto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    
    private static final DeviceRgb PRIMARY_COLOR = new DeviceRgb(59, 130, 246);
    private static final DeviceRgb HEADER_BG = new DeviceRgb(241, 245, 249);
    private static final DeviceRgb SUCCESS_COLOR = new DeviceRgb(34, 197, 94);
    private static final DeviceRgb WARNING_COLOR = new DeviceRgb(234, 179, 8);
    private static final DeviceRgb DANGER_COLOR = new DeviceRgb(239, 68, 68);

    public byte[] generateEmployeeUtilizationReport(EmployeeUtilizationReport report) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4.rotate());
            document.setMargins(30, 30, 30, 30);
            
            // Title
            addTitle(document, "Employee Utilization Report");
            addSubtitle(document, "Generated: " + report.getGeneratedAt().format(DATETIME_FORMATTER));
            addSubtitle(document, "Period: " + report.getPeriodStart() + " to " + report.getPeriodEnd());
            
            // Summary cards
            Table summaryTable = new Table(UnitValue.createPercentArray(4)).useAllAvailableWidth();
            addSummaryCard(summaryTable, "Total Employees", String.valueOf(report.getTotalEmployees()), PRIMARY_COLOR);
            addSummaryCard(summaryTable, "Allocated", String.valueOf(report.getAllocatedEmployees()), SUCCESS_COLOR);
            addSummaryCard(summaryTable, "On Bench", String.valueOf(report.getBenchEmployees()), WARNING_COLOR);
            addSummaryCard(summaryTable, "Avg Utilization", String.format("%.1f%%", report.getAverageUtilization()), PRIMARY_COLOR);
            document.add(summaryTable);
            document.add(new Paragraph("\n"));
            
            // Employee table
            Table table = new Table(UnitValue.createPercentArray(new float[]{1.5f, 2f, 1.5f, 1.5f, 1f, 1f, 1.2f, 1f, 1f})).useAllAvailableWidth();
            addTableHeader(table, "Emp ID", "Name", "Department", "Designation", "FTE", "Max FTE", "Utilization", "Projects", "Status");
            
            for (EmployeeUtilizationRow emp : report.getEmployees()) {
                table.addCell(createCell(emp.getEmployeeId()));
                table.addCell(createCell(emp.getName()));
                table.addCell(createCell(emp.getDepartment()));
                table.addCell(createCell(emp.getDesignation()));
                table.addCell(createCell(String.format("%.2f", emp.getCurrentFTE())));
                table.addCell(createCell(String.format("%.2f", emp.getMaxFTE())));
                table.addCell(createUtilizationCell(emp.getUtilizationPercentage()));
                table.addCell(createCell(String.valueOf(emp.getActiveProjects())));
                table.addCell(createStatusCell(emp.getStatus()));
            }
            document.add(table);
            
            // Department breakdown
            if (report.getDepartmentUtilization() != null && !report.getDepartmentUtilization().isEmpty()) {
                document.add(new AreaBreak());
                addTitle(document, "Utilization by Department");
                
                Table deptTable = new Table(UnitValue.createPercentArray(2)).useAllAvailableWidth();
                addTableHeader(deptTable, "Department", "Utilization");
                
                for (Map.Entry<String, Double> entry : report.getDepartmentUtilization().entrySet()) {
                    deptTable.addCell(createCell(entry.getKey()));
                    deptTable.addCell(createUtilizationCell(entry.getValue()));
                }
                document.add(deptTable);
            }
            
            document.close();
            return out.toByteArray();
        }
    }

    public byte[] generateBenchReport(BenchReport report) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4.rotate());
            document.setMargins(30, 30, 30, 30);
            
            addTitle(document, "Bench Report");
            addSubtitle(document, "Generated: " + report.getGeneratedAt().format(DATETIME_FORMATTER));
            
            // Summary
            Table summaryTable = new Table(UnitValue.createPercentArray(2)).useAllAvailableWidth();
            addSummaryCard(summaryTable, "Total on Bench", String.valueOf(report.getTotalBenchEmployees()), WARNING_COLOR);
            addSummaryCard(summaryTable, "Avg Days on Bench", String.format("%.1f", report.getAverageBenchDays()), PRIMARY_COLOR);
            document.add(summaryTable);
            document.add(new Paragraph("\n"));
            
            // Bench employees table
            Table table = new Table(UnitValue.createPercentArray(new float[]{1.5f, 2f, 1.5f, 1.5f, 1.5f, 1f, 3f})).useAllAvailableWidth();
            addTableHeader(table, "Emp ID", "Name", "Department", "Designation", "Last Project End", "Days", "Top Skills");
            
            for (BenchEmployeeRow emp : report.getEmployees()) {
                table.addCell(createCell(emp.getEmployeeId()));
                table.addCell(createCell(emp.getName()));
                table.addCell(createCell(emp.getDepartment()));
                table.addCell(createCell(emp.getDesignation()));
                table.addCell(createCell(emp.getLastProjectEndDate() != null ? emp.getLastProjectEndDate().toString() : "N/A"));
                table.addCell(createDaysCell(emp.getDaysOnBench()));
                table.addCell(createCell(emp.getTopSkills() != null ? String.join(", ", emp.getTopSkills()) : ""));
            }
            document.add(table);
            
            // Department breakdown
            if (report.getBenchByDepartment() != null && !report.getBenchByDepartment().isEmpty()) {
                document.add(new Paragraph("\n\n"));
                addSectionTitle(document, "Bench by Department");
                
                Table deptTable = new Table(UnitValue.createPercentArray(2)).useAllAvailableWidth();
                addTableHeader(deptTable, "Department", "Count");
                
                for (Map.Entry<String, Integer> entry : report.getBenchByDepartment().entrySet()) {
                    deptTable.addCell(createCell(entry.getKey()));
                    deptTable.addCell(createCell(String.valueOf(entry.getValue())));
                }
                document.add(deptTable);
            }
            
            document.close();
            return out.toByteArray();
        }
    }

    public byte[] generateTrainingProgressReport(TrainingProgressReport report) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4.rotate());
            document.setMargins(30, 30, 30, 30);
            
            addTitle(document, "Training Progress Report");
            addSubtitle(document, "Generated: " + report.getGeneratedAt().format(DATETIME_FORMATTER));
            
            // Summary
            Table summaryTable = new Table(UnitValue.createPercentArray(4)).useAllAvailableWidth();
            addSummaryCard(summaryTable, "Total Trainings", String.valueOf(report.getTotalTrainings()), PRIMARY_COLOR);
            addSummaryCard(summaryTable, "Completed", String.valueOf(report.getCompletedAssignments()), SUCCESS_COLOR);
            addSummaryCard(summaryTable, "In Progress", String.valueOf(report.getTotalAssignments() - report.getCompletedAssignments() - report.getOverdueAssignments()), WARNING_COLOR);
            addSummaryCard(summaryTable, "Overdue", String.valueOf(report.getOverdueAssignments()), DANGER_COLOR);
            document.add(summaryTable);
            document.add(new Paragraph("\n"));
            
            // Training table
            addSectionTitle(document, "Training Breakdown");
            Table table = new Table(UnitValue.createPercentArray(new float[]{3f, 1.5f, 1f, 1f, 1f, 1f, 1f, 1.2f})).useAllAvailableWidth();
            addTableHeader(table, "Training", "Category", "Difficulty", "Assigned", "Completed", "In Progress", "Overdue", "Rate");
            
            for (TrainingRow training : report.getTrainings()) {
                table.addCell(createCell(training.getTitle()));
                table.addCell(createCell(training.getCategory()));
                table.addCell(createCell(training.getDifficulty()));
                table.addCell(createCell(String.valueOf(training.getTotalAssigned())));
                table.addCell(createCell(String.valueOf(training.getCompleted())));
                table.addCell(createCell(String.valueOf(training.getInProgress())));
                table.addCell(createCell(String.valueOf(training.getOverdue())));
                table.addCell(createUtilizationCell(training.getCompletionRate()));
            }
            document.add(table);
            
            // Employee progress
            document.add(new AreaBreak());
            addTitle(document, "Employee Training Progress");
            
            Table empTable = new Table(UnitValue.createPercentArray(new float[]{1.5f, 2f, 1.5f, 1f, 1f, 1f, 1f, 1.2f})).useAllAvailableWidth();
            addTableHeader(empTable, "Emp ID", "Name", "Department", "Assigned", "Completed", "In Progress", "Overdue", "Rate");
            
            for (EmployeeTrainingRow emp : report.getEmployeeProgress()) {
                empTable.addCell(createCell(emp.getEmployeeId()));
                empTable.addCell(createCell(emp.getEmployeeName()));
                empTable.addCell(createCell(emp.getDepartment()));
                empTable.addCell(createCell(String.valueOf(emp.getTotalAssigned())));
                empTable.addCell(createCell(String.valueOf(emp.getCompleted())));
                empTable.addCell(createCell(String.valueOf(emp.getInProgress())));
                empTable.addCell(createCell(String.valueOf(emp.getOverdue())));
                empTable.addCell(createUtilizationCell(emp.getCompletionRate()));
            }
            document.add(empTable);
            
            document.close();
            return out.toByteArray();
        }
    }

    public byte[] generateDailySummaryReport(DailySummaryReport report) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(40, 40, 40, 40);
            
            addTitle(document, "Daily Summary Report");
            addSubtitle(document, "Date: " + report.getReportDate());
            addSubtitle(document, "Generated: " + report.getGeneratedAt().format(DATETIME_FORMATTER));
            
            // Employee Section
            addSectionTitle(document, "👥 Employee Metrics");
            Table empTable = new Table(UnitValue.createPercentArray(3)).useAllAvailableWidth();
            addSummaryCard(empTable, "Total Employees", String.valueOf(report.getTotalEmployees()), PRIMARY_COLOR);
            addSummaryCard(empTable, "New Today", String.valueOf(report.getNewEmployeesToday()), SUCCESS_COLOR);
            addSummaryCard(empTable, "On Leave", String.valueOf(report.getEmployeesOnLeave()), WARNING_COLOR);
            document.add(empTable);
            document.add(new Paragraph("\n"));
            
            // Project Section
            addSectionTitle(document, "📁 Project Metrics");
            Table projTable = new Table(UnitValue.createPercentArray(3)).useAllAvailableWidth();
            addSummaryCard(projTable, "Active Projects", String.valueOf(report.getActiveProjects()), PRIMARY_COLOR);
            addSummaryCard(projTable, "Starting Today", String.valueOf(report.getProjectsStartingToday()), SUCCESS_COLOR);
            addSummaryCard(projTable, "Ending Today", String.valueOf(report.getProjectsEndingToday()), WARNING_COLOR);
            document.add(projTable);
            document.add(new Paragraph("\n"));
            
            // Allocation Section
            addSectionTitle(document, "📊 Allocation Metrics");
            Table allocTable = new Table(UnitValue.createPercentArray(3)).useAllAvailableWidth();
            addSummaryCard(allocTable, "New Allocations", String.valueOf(report.getAllocationsCreated()), SUCCESS_COLOR);
            addSummaryCard(allocTable, "Ending Soon", String.valueOf(report.getAllocationsEnding()), WARNING_COLOR);
            addSummaryCard(allocTable, "Overall Utilization", String.format("%.1f%%", report.getOverallUtilization()), PRIMARY_COLOR);
            document.add(allocTable);
            document.add(new Paragraph("\n"));
            
            // Training Section
            addSectionTitle(document, "📚 Training Metrics");
            Table trainTable = new Table(UnitValue.createPercentArray(3)).useAllAvailableWidth();
            addSummaryCard(trainTable, "Assigned", String.valueOf(report.getTrainingsAssigned()), PRIMARY_COLOR);
            addSummaryCard(trainTable, "Completed", String.valueOf(report.getTrainingsCompleted()), SUCCESS_COLOR);
            addSummaryCard(trainTable, "Overdue", String.valueOf(report.getOverdueTrainings()), DANGER_COLOR);
            document.add(trainTable);
            document.add(new Paragraph("\n"));
            
            // Alerts
            if (report.getCriticalAlerts() != null && !report.getCriticalAlerts().isEmpty()) {
                addSectionTitle(document, "🚨 Critical Alerts");
                for (String alert : report.getCriticalAlerts()) {
                    Paragraph p = new Paragraph("• " + alert)
                            .setFontColor(DANGER_COLOR)
                            .setMarginLeft(20);
                    document.add(p);
                }
            }
            
            if (report.getWarningAlerts() != null && !report.getWarningAlerts().isEmpty()) {
                document.add(new Paragraph("\n"));
                addSectionTitle(document, "⚠️ Warnings");
                for (String alert : report.getWarningAlerts()) {
                    Paragraph p = new Paragraph("• " + alert)
                            .setFontColor(WARNING_COLOR)
                            .setMarginLeft(20);
                    document.add(p);
                }
            }
            
            document.close();
            return out.toByteArray();
        }
    }

    public byte[] generateWeeklySummaryReport(WeeklySummaryReport report) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(40, 40, 40, 40);
            
            addTitle(document, "Weekly Summary Report");
            addSubtitle(document, "Week: " + report.getWeekStart() + " to " + report.getWeekEnd());
            addSubtitle(document, "Generated: " + report.getGeneratedAt().format(DATETIME_FORMATTER));
            
            // Employee Trends
            addSectionTitle(document, "👥 Employee Trends");
            Table empTable = new Table(UnitValue.createPercentArray(4)).useAllAvailableWidth();
            addSummaryCard(empTable, "Total Employees", String.valueOf(report.getTotalEmployees()), PRIMARY_COLOR);
            addSummaryCard(empTable, "New Joined", String.valueOf(report.getNewEmployees()), SUCCESS_COLOR);
            addSummaryCard(empTable, "Left", String.valueOf(report.getEmployeesLeft()), DANGER_COLOR);
            addSummaryCard(empTable, "Utilization Δ", String.format("%+.1f%%", report.getUtilizationChange()), 
                    report.getUtilizationChange() >= 0 ? SUCCESS_COLOR : DANGER_COLOR);
            document.add(empTable);
            document.add(new Paragraph("\n"));
            
            // Project Trends
            addSectionTitle(document, "📁 Project Trends");
            Table projTable = new Table(UnitValue.createPercentArray(3)).useAllAvailableWidth();
            addSummaryCard(projTable, "Started", String.valueOf(report.getProjectsStarted()), SUCCESS_COLOR);
            addSummaryCard(projTable, "Completed", String.valueOf(report.getProjectsCompleted()), PRIMARY_COLOR);
            addSummaryCard(projTable, "Delayed", String.valueOf(report.getProjectsDelayed()), DANGER_COLOR);
            document.add(projTable);
            document.add(new Paragraph("\n"));
            
            // Training Metrics
            addSectionTitle(document, "📚 Training & Development");
            Table trainTable = new Table(UnitValue.createPercentArray(3)).useAllAvailableWidth();
            addSummaryCard(trainTable, "Trainings Completed", String.valueOf(report.getTrainingsCompleted()), SUCCESS_COLOR);
            addSummaryCard(trainTable, "Certificates Issued", String.valueOf(report.getCertificatesIssued()), PRIMARY_COLOR);
            addSummaryCard(trainTable, "Avg Score", String.format("%.1f%%", report.getAvgTrainingScore()), PRIMARY_COLOR);
            document.add(trainTable);
            document.add(new Paragraph("\n"));
            
            // Skill Trends
            addSectionTitle(document, "🎯 Skill Trends");
            document.add(new Paragraph("New Skills Added: " + report.getNewSkillsAdded()));
            if (report.getTrendingSkills() != null && !report.getTrendingSkills().isEmpty()) {
                document.add(new Paragraph("Trending Skills: " + String.join(", ", report.getTrendingSkills())));
            }
            document.add(new Paragraph("\n"));
            
            // Highlights
            if (report.getTopPerformers() != null && !report.getTopPerformers().isEmpty()) {
                addSectionTitle(document, "⭐ Top Performers");
                for (String performer : report.getTopPerformers()) {
                    document.add(new Paragraph("• " + performer).setMarginLeft(20));
                }
            }
            
            if (report.getAttentionNeeded() != null && !report.getAttentionNeeded().isEmpty()) {
                document.add(new Paragraph("\n"));
                addSectionTitle(document, "⚠️ Attention Needed");
                for (String item : report.getAttentionNeeded()) {
                    Paragraph p = new Paragraph("• " + item)
                            .setFontColor(WARNING_COLOR)
                            .setMarginLeft(20);
                    document.add(p);
                }
            }
            
            document.close();
            return out.toByteArray();
        }
    }

    // Helper methods
    private void addTitle(Document document, String title) {
        Paragraph p = new Paragraph(title)
                .setFontSize(20)
                .setBold()
                .setFontColor(PRIMARY_COLOR)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(5);
        document.add(p);
    }

    private void addSubtitle(Document document, String subtitle) {
        Paragraph p = new Paragraph(subtitle)
                .setFontSize(10)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(p);
    }

    private void addSectionTitle(Document document, String title) {
        Paragraph p = new Paragraph(title)
                .setFontSize(14)
                .setBold()
                .setFontColor(PRIMARY_COLOR)
                .setMarginTop(10)
                .setMarginBottom(10);
        document.add(p);
    }

    private void addSummaryCard(Table table, String label, String value, DeviceRgb color) {
        Cell cell = new Cell()
                .add(new Paragraph(value).setBold().setFontSize(18).setFontColor(color))
                .add(new Paragraph(label).setFontSize(10).setFontColor(ColorConstants.GRAY))
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(10)
                .setBorder(Border.NO_BORDER);
        table.addCell(cell);
    }

    private void addTableHeader(Table table, String... headers) {
        for (String header : headers) {
            Cell cell = new Cell()
                    .add(new Paragraph(header).setBold().setFontSize(9))
                    .setBackgroundColor(HEADER_BG)
                    .setPadding(5)
                    .setTextAlignment(TextAlignment.CENTER);
            table.addHeaderCell(cell);
        }
    }

    private Cell createCell(String text) {
        return new Cell()
                .add(new Paragraph(text != null ? text : "").setFontSize(9))
                .setPadding(4)
                .setTextAlignment(TextAlignment.LEFT);
    }

    private Cell createUtilizationCell(double percentage) {
        DeviceRgb color;
        if (percentage >= 80) color = SUCCESS_COLOR;
        else if (percentage >= 50) color = WARNING_COLOR;
        else color = DANGER_COLOR;
        
        return new Cell()
                .add(new Paragraph(String.format("%.1f%%", percentage)).setFontSize(9).setFontColor(color))
                .setPadding(4)
                .setTextAlignment(TextAlignment.CENTER);
    }

    private Cell createStatusCell(String status) {
        DeviceRgb color;
        if ("ACTIVE".equals(status) || "AVAILABLE".equals(status)) color = SUCCESS_COLOR;
        else if ("ON_LEAVE".equals(status) || "PARTIALLY_AVAILABLE".equals(status)) color = WARNING_COLOR;
        else color = DANGER_COLOR;
        
        return new Cell()
                .add(new Paragraph(status != null ? status : "").setFontSize(9).setFontColor(color))
                .setPadding(4)
                .setTextAlignment(TextAlignment.CENTER);
    }

    private Cell createDaysCell(int days) {
        DeviceRgb color;
        if (days <= 7) color = SUCCESS_COLOR;
        else if (days <= 30) color = WARNING_COLOR;
        else color = DANGER_COLOR;
        
        return new Cell()
                .add(new Paragraph(String.valueOf(days)).setFontSize(9).setFontColor(color))
                .setPadding(4)
                .setTextAlignment(TextAlignment.CENTER);
    }
}


