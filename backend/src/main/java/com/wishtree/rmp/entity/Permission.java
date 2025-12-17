package com.wishtree.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private String module;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // Common permission codes
    public static final String DASHBOARD_VIEW = "DASHBOARD_VIEW";
    public static final String EMPLOYEE_VIEW = "EMPLOYEE_VIEW";
    public static final String EMPLOYEE_CREATE = "EMPLOYEE_CREATE";
    public static final String EMPLOYEE_EDIT = "EMPLOYEE_EDIT";
    public static final String EMPLOYEE_DELETE = "EMPLOYEE_DELETE";
    public static final String PROJECT_VIEW = "PROJECT_VIEW";
    public static final String PROJECT_CREATE = "PROJECT_CREATE";
    public static final String PROJECT_EDIT = "PROJECT_EDIT";
    public static final String PROJECT_DELETE = "PROJECT_DELETE";
    public static final String SKILL_VIEW = "SKILL_VIEW";
    public static final String SKILL_MANAGE = "SKILL_MANAGE";
    public static final String TRAINING_VIEW = "TRAINING_VIEW";
    public static final String TRAINING_MANAGE = "TRAINING_MANAGE";
    public static final String TRAINING_ASSIGN = "TRAINING_ASSIGN";
    public static final String ALLOCATION_VIEW = "ALLOCATION_VIEW";
    public static final String ALLOCATION_MANAGE = "ALLOCATION_MANAGE";
    public static final String REPORT_VIEW = "REPORT_VIEW";
    public static final String REPORT_EXPORT = "REPORT_EXPORT";
    public static final String USER_VIEW = "USER_VIEW";
    public static final String USER_MANAGE = "USER_MANAGE";
    public static final String ROLE_MANAGE = "ROLE_MANAGE";
    public static final String LEAVE_VIEW = "LEAVE_VIEW";
    public static final String LEAVE_MANAGE = "LEAVE_MANAGE";
    public static final String FORECASTING_VIEW = "FORECASTING_VIEW";
}

