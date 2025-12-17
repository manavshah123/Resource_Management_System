package com.rmp.controller;

import com.rmp.dto.CertificateDto;
import com.rmp.entity.User;
import com.rmp.repository.UserRepository;
import com.rmp.service.CertificateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/certificates")
@RequiredArgsConstructor
@Tag(name = "Certificates", description = "Training certificate management APIs")
public class CertificateController {

    private final CertificateService certificateService;
    private final UserRepository userRepository;

    @PostMapping("/generate/{assignmentId}")
    @Operation(summary = "Generate certificate for completed training")
    public ResponseEntity<CertificateDto> generateCertificate(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(certificateService.generateCertificate(assignmentId));
    }

    @GetMapping("/assignment/{assignmentId}")
    @Operation(summary = "Get certificate by assignment ID")
    public ResponseEntity<CertificateDto> getCertificateByAssignment(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(certificateService.getCertificateByAssignment(assignmentId));
    }

    @GetMapping("/verify/{certificateNumber}")
    @Operation(summary = "Verify certificate by certificate number")
    public ResponseEntity<CertificateDto> verifyCertificate(@PathVariable String certificateNumber) {
        return ResponseEntity.ok(certificateService.verifyCertificate(certificateNumber));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get all certificates for an employee")
    public ResponseEntity<List<CertificateDto>> getCertificatesByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(certificateService.getCertificatesByEmployee(employeeId));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my certificates")
    public ResponseEntity<List<CertificateDto>> getMyCertificates() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null || user.getEmployee() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(certificateService.getCertificatesByEmployee(user.getEmployee().getId()));
    }

    @GetMapping("/training/{trainingId}")
    @Operation(summary = "Get all certificates for a training")
    public ResponseEntity<List<CertificateDto>> getCertificatesByTraining(@PathVariable Long trainingId) {
        return ResponseEntity.ok(certificateService.getCertificatesByTraining(trainingId));
    }

    @GetMapping("/download/{assignmentId}")
    @Operation(summary = "Download certificate as HTML (for printing)")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable Long assignmentId) {
        byte[] certificateHtml = certificateService.generateCertificatePdf(assignmentId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_HTML);
        headers.add("Content-Disposition", "inline; filename=certificate.html");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(certificateHtml);
    }
}

