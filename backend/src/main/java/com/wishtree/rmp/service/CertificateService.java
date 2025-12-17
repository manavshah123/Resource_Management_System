package com.wishtree.rmp.service;

import com.wishtree.rmp.dto.CertificateDto;
import com.wishtree.rmp.entity.Certificate;
import com.wishtree.rmp.entity.TrainingAssignment;
import com.wishtree.rmp.exceptions.BadRequestException;
import com.wishtree.rmp.exceptions.ResourceNotFoundException;
import com.wishtree.rmp.repository.CertificateRepository;
import com.wishtree.rmp.repository.TrainingAssignmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final TrainingAssignmentRepository assignmentRepository;

    @Transactional
    public CertificateDto generateCertificate(Long assignmentId) {
        TrainingAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (assignment.getStatus() != TrainingAssignment.Status.COMPLETED) {
            throw new BadRequestException("Training must be completed to generate certificate");
        }

        return generateCertificateInternal(assignmentId, assignment);
    }

    private String generateCertificateNumber(TrainingAssignment assignment) {
        String prefix = "RMP";
        String year = String.valueOf(LocalDate.now().getYear());
        String trainingCode = assignment.getTraining().getTitle()
                .replaceAll("[^A-Za-z]", "")
                .substring(0, Math.min(3, assignment.getTraining().getTitle().length()))
                .toUpperCase();
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return prefix + "-" + year + "-" + trainingCode + "-" + uuid;
    }

    public CertificateDto getCertificateByAssignment(Long assignmentId) {
        Certificate certificate = certificateRepository.findByAssignmentId(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found for this assignment"));
        return CertificateDto.fromEntity(certificate);
    }

    public CertificateDto verifyCertificate(String certificateNumber) {
        Certificate certificate = certificateRepository.findByCertificateNumber(certificateNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
        return CertificateDto.fromEntity(certificate);
    }

    public List<CertificateDto> getCertificatesByEmployee(Long employeeId) {
        return certificateRepository.findByEmployeeId(employeeId).stream()
                .map(CertificateDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CertificateDto> getCertificatesByTraining(Long trainingId) {
        return certificateRepository.findByTrainingId(trainingId).stream()
                .map(CertificateDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public byte[] generateCertificatePdf(Long assignmentId) {
        TrainingAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (assignment.getStatus() != TrainingAssignment.Status.COMPLETED) {
            throw new BadRequestException("Training must be completed to download certificate");
        }

        // Generate certificate if not exists
        CertificateDto cert = generateCertificateInternal(assignmentId, assignment);

        // Generate HTML certificate that will be returned for frontend to render/print
        return generateCertificateHtml(assignment, cert).getBytes();
    }

    private CertificateDto generateCertificateInternal(Long assignmentId, TrainingAssignment assignment) {
        // Check if certificate already exists
        if (certificateRepository.existsByAssignmentId(assignmentId)) {
            Certificate existing = certificateRepository.findByAssignmentId(assignmentId).orElseThrow();
            return CertificateDto.fromEntity(existing);
        }

        // Generate unique certificate number
        String certNumber = generateCertificateNumber(assignment);

        Certificate certificate = Certificate.builder()
                .certificateNumber(certNumber)
                .employee(assignment.getEmployee())
                .training(assignment.getTraining())
                .assignment(assignment)
                .issuedDate(LocalDate.now())
                .issuedBy("Resource Management Portal")
                .verificationUrl("/api/certificates/verify/" + certNumber)
                .status(Certificate.Status.ACTIVE)
                .build();

        // Set expiry date for certifications (e.g., 2 years)
        if (assignment.getTraining().getCategory().name().equals("CERTIFICATION")) {
            certificate.setExpiryDate(LocalDate.now().plusYears(2));
        }

        Certificate saved = certificateRepository.save(certificate);
        log.info("Generated certificate {} for employee {} - training {}", 
                certNumber, assignment.getEmployee().getName(), assignment.getTraining().getTitle());

        return CertificateDto.fromEntity(saved);
    }

    private String generateCertificateHtml(TrainingAssignment assignment, CertificateDto cert) {
        String employeeName = assignment.getEmployee().getName();
        String trainingTitle = assignment.getTraining().getTitle();
        String category = assignment.getTraining().getCategory().name().replace("_", " ");
        String difficulty = assignment.getTraining().getDifficulty().name();
        String completionDate = assignment.getCompletedAt() != null 
                ? assignment.getCompletedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"))
                : LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
        String certNumber = cert.getCertificateNumber();

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;400;600&display=swap');
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Montserrat', sans-serif;
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                        min-height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 40px;
                    }
                    .certificate {
                        width: 900px;
                        background: #fff;
                        border-radius: 20px;
                        padding: 60px;
                        box-shadow: 0 25px 80px rgba(0,0,0,0.3);
                        position: relative;
                        overflow: hidden;
                    }
                    .certificate::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 8px;
                        background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
                    }
                    .certificate::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 8px;
                        background: linear-gradient(90deg, #f5576c, #f093fb, #764ba2, #667eea);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 40px;
                    }
                    .logo {
                        width: 80px;
                        height: 80px;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        border-radius: 50%%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 20px;
                        font-size: 32px;
                        color: white;
                        font-weight: bold;
                    }
                    .title {
                        font-family: 'Playfair Display', serif;
                        font-size: 48px;
                        color: #333;
                        letter-spacing: 3px;
                        margin-bottom: 10px;
                    }
                    .subtitle {
                        font-size: 14px;
                        color: #888;
                        text-transform: uppercase;
                        letter-spacing: 4px;
                    }
                    .content {
                        text-align: center;
                        margin: 40px 0;
                    }
                    .presented-to {
                        font-size: 14px;
                        color: #888;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        margin-bottom: 15px;
                    }
                    .recipient-name {
                        font-family: 'Playfair Display', serif;
                        font-size: 42px;
                        color: #333;
                        margin-bottom: 30px;
                        border-bottom: 3px solid #667eea;
                        padding-bottom: 15px;
                        display: inline-block;
                    }
                    .description {
                        font-size: 16px;
                        color: #666;
                        line-height: 1.8;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    .training-name {
                        font-weight: 600;
                        color: #667eea;
                        font-size: 22px;
                        display: block;
                        margin: 15px 0;
                    }
                    .badges {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        margin: 25px 0;
                    }
                    .badge {
                        padding: 8px 20px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .badge-category {
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                    }
                    .badge-level {
                        background: #f0f0f0;
                        color: #666;
                    }
                    .footer {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        margin-top: 50px;
                        padding-top: 30px;
                        border-top: 1px solid #eee;
                    }
                    .signature {
                        text-align: center;
                    }
                    .signature-line {
                        width: 200px;
                        border-bottom: 2px solid #333;
                        margin-bottom: 10px;
                    }
                    .signature-name {
                        font-weight: 600;
                        color: #333;
                    }
                    .signature-title {
                        font-size: 12px;
                        color: #888;
                    }
                    .cert-info {
                        text-align: right;
                        font-size: 12px;
                        color: #888;
                    }
                    .cert-number {
                        font-family: monospace;
                        font-size: 14px;
                        color: #667eea;
                        font-weight: 600;
                    }
                    @media print {
                        body { background: white; padding: 0; }
                        .certificate { box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <div class="header">
                        <div class="logo">R</div>
                        <h1 class="title">Certificate</h1>
                        <p class="subtitle">of Completion</p>
                    </div>
                    <div class="content">
                        <p class="presented-to">This is to certify that</p>
                        <h2 class="recipient-name">%s</h2>
                        <p class="description">
                            has successfully completed the training program
                            <span class="training-name">%s</span>
                            demonstrating commitment to professional development and skill enhancement.
                        </p>
                        <div class="badges">
                            <span class="badge badge-category">%s</span>
                            <span class="badge badge-level">%s Level</span>
                        </div>
                    </div>
                    <div class="footer">
                        <div class="signature">
                            <div class="signature-line"></div>
                            <p class="signature-name">Training Department</p>
                            <p class="signature-title">Resource Management Portal</p>
                        </div>
                        <div class="cert-info">
                            <p>Date of Completion: <strong>%s</strong></p>
                            <p>Certificate No: <span class="cert-number">%s</span></p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(employeeName, trainingTitle, category, difficulty, completionDate, certNumber);
    }
}

