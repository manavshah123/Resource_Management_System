package com.rmp.service.report;

import com.rmp.dto.report.ReportDto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public byte[] generateEmployeeUtilizationReport(EmployeeUtilizationReport report) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Employee Utilization");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle percentStyle = createPercentStyle(workbook);
            
            int rowNum = 0;
            
            // Title
            Row titleRow = sheet.createRow(rowNum++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Employee Utilization Report");
            titleCell.setCellStyle(createTitleStyle(workbook));
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 7));
            
            // Generated info
            Row infoRow = sheet.createRow(rowNum++);
            infoRow.createCell(0).setCellValue("Generated: " + report.getGeneratedAt().format(DATETIME_FORMATTER));
            infoRow.createCell(3).setCellValue("Period: " + report.getPeriodStart() + " to " + report.getPeriodEnd());
            rowNum++;
            
            // Summary
            Row summaryRow1 = sheet.createRow(rowNum++);
            summaryRow1.createCell(0).setCellValue("Total Employees: " + report.getTotalEmployees());
            summaryRow1.createCell(2).setCellValue("Allocated: " + report.getAllocatedEmployees());
            summaryRow1.createCell(4).setCellValue("On Bench: " + report.getBenchEmployees());
            summaryRow1.createCell(6).setCellValue("Avg Utilization: " + String.format("%.1f%%", report.getAverageUtilization()));
            rowNum++;
            
            // Header row
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"Employee ID", "Name", "Department", "Designation", "Current FTE", "Max FTE", "Utilization %", "Active Projects", "Status"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Data rows
            for (EmployeeUtilizationRow emp : report.getEmployees()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(emp.getEmployeeId());
                row.createCell(1).setCellValue(emp.getName());
                row.createCell(2).setCellValue(emp.getDepartment());
                row.createCell(3).setCellValue(emp.getDesignation());
                row.createCell(4).setCellValue(emp.getCurrentFTE());
                row.createCell(5).setCellValue(emp.getMaxFTE());
                
                Cell utilCell = row.createCell(6);
                utilCell.setCellValue(emp.getUtilizationPercentage() / 100);
                utilCell.setCellStyle(percentStyle);
                
                row.createCell(7).setCellValue(emp.getActiveProjects());
                row.createCell(8).setCellValue(emp.getStatus());
            }
            
            // Department breakdown sheet
            if (report.getDepartmentUtilization() != null && !report.getDepartmentUtilization().isEmpty()) {
                Sheet deptSheet = workbook.createSheet("By Department");
                rowNum = 0;
                
                Row deptHeader = deptSheet.createRow(rowNum++);
                deptHeader.createCell(0).setCellValue("Department");
                deptHeader.createCell(1).setCellValue("Utilization %");
                deptHeader.getCell(0).setCellStyle(headerStyle);
                deptHeader.getCell(1).setCellStyle(headerStyle);
                
                for (Map.Entry<String, Double> entry : report.getDepartmentUtilization().entrySet()) {
                    Row row = deptSheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(entry.getKey());
                    Cell cell = row.createCell(1);
                    cell.setCellValue(entry.getValue() / 100);
                    cell.setCellStyle(percentStyle);
                }
                
                deptSheet.autoSizeColumn(0);
                deptSheet.autoSizeColumn(1);
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            return toByteArray(workbook);
        }
    }

    public byte[] generateBenchReport(BenchReport report) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Bench Report");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            int rowNum = 0;
            
            // Title
            Row titleRow = sheet.createRow(rowNum++);
            titleRow.createCell(0).setCellValue("Bench Report");
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));
            
            Row infoRow = sheet.createRow(rowNum++);
            infoRow.createCell(0).setCellValue("Generated: " + report.getGeneratedAt().format(DATETIME_FORMATTER));
            rowNum++;
            
            // Summary
            Row summaryRow = sheet.createRow(rowNum++);
            summaryRow.createCell(0).setCellValue("Total on Bench: " + report.getTotalBenchEmployees());
            summaryRow.createCell(3).setCellValue("Avg Days on Bench: " + String.format("%.1f", report.getAverageBenchDays()));
            rowNum++;
            
            // Header
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"Employee ID", "Name", "Department", "Designation", "Last Project End", "Days on Bench", "Top Skills"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Data
            for (BenchEmployeeRow emp : report.getEmployees()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(emp.getEmployeeId());
                row.createCell(1).setCellValue(emp.getName());
                row.createCell(2).setCellValue(emp.getDepartment());
                row.createCell(3).setCellValue(emp.getDesignation());
                row.createCell(4).setCellValue(emp.getLastProjectEndDate() != null ? emp.getLastProjectEndDate().toString() : "N/A");
                row.createCell(5).setCellValue(emp.getDaysOnBench());
                row.createCell(6).setCellValue(emp.getTopSkills() != null ? String.join(", ", emp.getTopSkills()) : "");
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            return toByteArray(workbook);
        }
    }

    public byte[] generateTrainingProgressReport(TrainingProgressReport report) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Training Progress");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle percentStyle = createPercentStyle(workbook);
            int rowNum = 0;
            
            // Title
            Row titleRow = sheet.createRow(rowNum++);
            titleRow.createCell(0).setCellValue("Training Progress Report");
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 7));
            
            Row infoRow = sheet.createRow(rowNum++);
            infoRow.createCell(0).setCellValue("Generated: " + report.getGeneratedAt().format(DATETIME_FORMATTER));
            rowNum++;
            
            // Summary
            Row summaryRow = sheet.createRow(rowNum++);
            summaryRow.createCell(0).setCellValue("Total Trainings: " + report.getTotalTrainings());
            summaryRow.createCell(2).setCellValue("Total Assignments: " + report.getTotalAssignments());
            summaryRow.createCell(4).setCellValue("Completed: " + report.getCompletedAssignments());
            summaryRow.createCell(6).setCellValue("Overdue: " + report.getOverdueAssignments());
            rowNum++;
            
            // Training breakdown
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"Training", "Category", "Difficulty", "Assigned", "Completed", "In Progress", "Overdue", "Completion Rate"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            for (TrainingRow training : report.getTrainings()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(training.getTitle());
                row.createCell(1).setCellValue(training.getCategory());
                row.createCell(2).setCellValue(training.getDifficulty());
                row.createCell(3).setCellValue(training.getTotalAssigned());
                row.createCell(4).setCellValue(training.getCompleted());
                row.createCell(5).setCellValue(training.getInProgress());
                row.createCell(6).setCellValue(training.getOverdue());
                
                Cell rateCell = row.createCell(7);
                rateCell.setCellValue(training.getCompletionRate() / 100);
                rateCell.setCellStyle(percentStyle);
            }
            
            // Employee progress sheet
            Sheet empSheet = workbook.createSheet("Employee Progress");
            rowNum = 0;
            
            Row empHeader = empSheet.createRow(rowNum++);
            String[] empHeaders = {"Employee ID", "Name", "Department", "Assigned", "Completed", "In Progress", "Overdue", "Completion Rate"};
            for (int i = 0; i < empHeaders.length; i++) {
                Cell cell = empHeader.createCell(i);
                cell.setCellValue(empHeaders[i]);
                cell.setCellStyle(headerStyle);
            }
            
            for (EmployeeTrainingRow emp : report.getEmployeeProgress()) {
                Row row = empSheet.createRow(rowNum++);
                row.createCell(0).setCellValue(emp.getEmployeeId());
                row.createCell(1).setCellValue(emp.getEmployeeName());
                row.createCell(2).setCellValue(emp.getDepartment());
                row.createCell(3).setCellValue(emp.getTotalAssigned());
                row.createCell(4).setCellValue(emp.getCompleted());
                row.createCell(5).setCellValue(emp.getInProgress());
                row.createCell(6).setCellValue(emp.getOverdue());
                
                Cell rateCell = row.createCell(7);
                rateCell.setCellValue(emp.getCompletionRate() / 100);
                rateCell.setCellStyle(percentStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                empSheet.autoSizeColumn(i);
            }
            
            return toByteArray(workbook);
        }
    }

    public byte[] generateSkillEvolutionReport(SkillEvolutionReport report) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Skill Evolution");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle percentStyle = createPercentStyle(workbook);
            int rowNum = 0;
            
            // Title and summary
            Row titleRow = sheet.createRow(rowNum++);
            titleRow.createCell(0).setCellValue("Skill Evolution Report");
            rowNum++;
            
            Row infoRow = sheet.createRow(rowNum++);
            infoRow.createCell(0).setCellValue("Period: " + report.getPeriodStart() + " to " + report.getPeriodEnd());
            infoRow.createCell(3).setCellValue("New Skills: " + report.getNewSkillsAdded());
            rowNum++;
            
            // Skill growth
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"Skill", "Category", "Previous Count", "Current Count", "Growth", "Growth %"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            for (SkillGrowthRow skill : report.getSkillGrowth()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(skill.getSkillName());
                row.createCell(1).setCellValue(skill.getCategory());
                row.createCell(2).setCellValue(skill.getPreviousCount());
                row.createCell(3).setCellValue(skill.getCurrentCount());
                row.createCell(4).setCellValue(skill.getGrowth());
                
                Cell growthCell = row.createCell(5);
                growthCell.setCellValue(skill.getGrowthPercentage() / 100);
                growthCell.setCellStyle(percentStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            return toByteArray(workbook);
        }
    }

    public byte[] generateProjectNeedsReport(ProjectNeedsReport report) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Project Needs");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            int rowNum = 0;
            
            Row titleRow = sheet.createRow(rowNum++);
            titleRow.createCell(0).setCellValue("Upcoming Project Needs Report");
            rowNum++;
            
            Row summaryRow = sheet.createRow(rowNum++);
            summaryRow.createCell(0).setCellValue("Upcoming Projects: " + report.getUpcomingProjects());
            summaryRow.createCell(3).setCellValue("Total Resources Needed: " + report.getTotalResourcesNeeded());
            rowNum++;
            
            // Projects
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"Project", "Client", "Start Date", "End Date", "Team Size", "Resources Needed", "Required Skills", "Missing Skills"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            for (ProjectNeedRow project : report.getProjects()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(project.getProjectName());
                row.createCell(1).setCellValue(project.getClient());
                row.createCell(2).setCellValue(project.getStartDate().toString());
                row.createCell(3).setCellValue(project.getEndDate().toString());
                row.createCell(4).setCellValue(project.getTeamSize());
                row.createCell(5).setCellValue(project.getResourcesNeeded());
                row.createCell(6).setCellValue(project.getRequiredSkills() != null ? String.join(", ", project.getRequiredSkills()) : "");
                row.createCell(7).setCellValue(project.getMissingSkills() != null ? String.join(", ", project.getMissingSkills()) : "");
            }
            
            // Skill gaps sheet
            Sheet gapSheet = workbook.createSheet("Skill Gaps");
            rowNum = 0;
            
            Row gapHeader = gapSheet.createRow(rowNum++);
            gapHeader.createCell(0).setCellValue("Skill");
            gapHeader.createCell(1).setCellValue("Required");
            gapHeader.createCell(2).setCellValue("Available");
            gapHeader.createCell(3).setCellValue("Gap");
            
            for (SkillGapRow gap : report.getSkillGaps()) {
                Row row = gapSheet.createRow(rowNum++);
                row.createCell(0).setCellValue(gap.getSkillName());
                row.createCell(1).setCellValue(gap.getRequired());
                row.createCell(2).setCellValue(gap.getAvailable());
                row.createCell(3).setCellValue(gap.getGap());
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            for (int i = 0; i < 4; i++) {
                gapSheet.autoSizeColumn(i);
            }
            
            return toByteArray(workbook);
        }
    }

    public byte[] generatePerformanceReport(PerformanceReport report) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Performance Scores");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle percentStyle = createPercentStyle(workbook);
            int rowNum = 0;
            
            Row titleRow = sheet.createRow(rowNum++);
            titleRow.createCell(0).setCellValue("Performance Report");
            rowNum++;
            
            Row infoRow = sheet.createRow(rowNum++);
            infoRow.createCell(0).setCellValue("Period: " + report.getPeriodStart() + " to " + report.getPeriodEnd());
            rowNum++;
            
            Row summaryRow = sheet.createRow(rowNum++);
            summaryRow.createCell(0).setCellValue("Avg Quiz Score: " + String.format("%.1f%%", report.getAverageQuizScore()));
            summaryRow.createCell(3).setCellValue("Certificates Issued: " + report.getCertificatesIssued());
            rowNum++;
            
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"Employee ID", "Name", "Department", "Quizzes Taken", "Avg Quiz Score", "Trainings Completed", "Certificates", "Skills Acquired", "Performance Score"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            for (EmployeePerformanceRow emp : report.getEmployees()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(emp.getEmployeeId());
                row.createCell(1).setCellValue(emp.getName());
                row.createCell(2).setCellValue(emp.getDepartment());
                row.createCell(3).setCellValue(emp.getQuizzesTaken());
                
                Cell scoreCell = row.createCell(4);
                scoreCell.setCellValue(emp.getAverageQuizScore() / 100);
                scoreCell.setCellStyle(percentStyle);
                
                row.createCell(5).setCellValue(emp.getTrainingsCompleted());
                row.createCell(6).setCellValue(emp.getCertificatesEarned());
                row.createCell(7).setCellValue(emp.getSkillsAcquired());
                
                Cell perfCell = row.createCell(8);
                perfCell.setCellValue(emp.getPerformanceScore() / 100);
                perfCell.setCellStyle(percentStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            return toByteArray(workbook);
        }
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        style.setFont(font);
        return style;
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createPercentStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("0.0%"));
        return style;
    }

    private byte[] toByteArray(Workbook workbook) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            workbook.write(out);
            return out.toByteArray();
        }
    }
}


