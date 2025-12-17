package com.wishtree.rmp.dto;

import com.wishtree.rmp.entity.Certificate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateDto {

    private Long id;
    private String certificateNumber;
    private Long employeeId;
    private String employeeName;
    private Long trainingId;
    private String trainingTitle;
    private String trainingCategory;
    private Long assignmentId;
    private LocalDate issuedDate;
    private LocalDate expiryDate;
    private String issuedBy;
    private String verificationUrl;
    private String status;

    public static CertificateDto fromEntity(Certificate cert) {
        return CertificateDto.builder()
                .id(cert.getId())
                .certificateNumber(cert.getCertificateNumber())
                .employeeId(cert.getEmployee().getId())
                .employeeName(cert.getEmployee().getName())
                .trainingId(cert.getTraining().getId())
                .trainingTitle(cert.getTraining().getTitle())
                .trainingCategory(cert.getTraining().getCategory().name())
                .assignmentId(cert.getAssignment().getId())
                .issuedDate(cert.getIssuedDate())
                .expiryDate(cert.getExpiryDate())
                .issuedBy(cert.getIssuedBy())
                .verificationUrl(cert.getVerificationUrl())
                .status(cert.getStatus().name())
                .build();
    }
}

