package com.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

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

    // ========================================
    // DASHBOARD MODULE
    // ========================================
    public static final String DASHBOARD_VIEW = "DASHBOARD_VIEW";
    public static final String DASHBOARD_ANALYTICS = "DASHBOARD_ANALYTICS";

    // ========================================
    // EMPLOYEE MODULE
    // ========================================
    public static final String EMPLOYEE_VIEW = "EMPLOYEE_VIEW";
    public static final String EMPLOYEE_VIEW_ALL = "EMPLOYEE_VIEW_ALL";
    public static final String EMPLOYEE_CREATE = "EMPLOYEE_CREATE";
    public static final String EMPLOYEE_EDIT = "EMPLOYEE_EDIT";
    public static final String EMPLOYEE_DELETE = "EMPLOYEE_DELETE";
    public static final String EMPLOYEE_IMPORT = "EMPLOYEE_IMPORT";
    public static final String EMPLOYEE_EXPORT = "EMPLOYEE_EXPORT";

    // ========================================
    // PROJECT MODULE
    // ========================================
    public static final String PROJECT_VIEW = "PROJECT_VIEW";
    public static final String PROJECT_VIEW_ALL = "PROJECT_VIEW_ALL";
    public static final String PROJECT_CREATE = "PROJECT_CREATE";
    public static final String PROJECT_EDIT = "PROJECT_EDIT";
    public static final String PROJECT_DELETE = "PROJECT_DELETE";
    public static final String PROJECT_MANAGE_TEAM = "PROJECT_MANAGE_TEAM";

    // ========================================
    // SKILL MODULE
    // ========================================
    public static final String SKILL_VIEW = "SKILL_VIEW";
    public static final String SKILL_CREATE = "SKILL_CREATE";
    public static final String SKILL_EDIT = "SKILL_EDIT";
    public static final String SKILL_DELETE = "SKILL_DELETE";
    public static final String SKILL_MANAGE = "SKILL_MANAGE";

    // ========================================
    // SKILL CATEGORY MODULE
    // ========================================
    public static final String SKILL_CATEGORY_VIEW = "SKILL_CATEGORY_VIEW";
    public static final String SKILL_CATEGORY_MANAGE = "SKILL_CATEGORY_MANAGE";

    // ========================================
    // SKILL GAP MODULE
    // ========================================
    public static final String SKILL_GAP_VIEW = "SKILL_GAP_VIEW";
    public static final String SKILL_GAP_ANALYZE = "SKILL_GAP_ANALYZE";

    // ========================================
    // TRAINING MODULE
    // ========================================
    public static final String TRAINING_VIEW = "TRAINING_VIEW";
    public static final String TRAINING_VIEW_ALL = "TRAINING_VIEW_ALL";
    public static final String TRAINING_CREATE = "TRAINING_CREATE";
    public static final String TRAINING_EDIT = "TRAINING_EDIT";
    public static final String TRAINING_DELETE = "TRAINING_DELETE";
    public static final String TRAINING_MANAGE = "TRAINING_MANAGE";
    public static final String TRAINING_ASSIGN = "TRAINING_ASSIGN";
    public static final String TRAINING_COMPLETE = "TRAINING_COMPLETE";

    // ========================================
    // QUIZ MODULE
    // ========================================
    public static final String QUIZ_VIEW = "QUIZ_VIEW";
    public static final String QUIZ_CREATE = "QUIZ_CREATE";
    public static final String QUIZ_EDIT = "QUIZ_EDIT";
    public static final String QUIZ_DELETE = "QUIZ_DELETE";
    public static final String QUIZ_MANAGE = "QUIZ_MANAGE";
    public static final String QUIZ_ASSIGN = "QUIZ_ASSIGN";
    public static final String QUIZ_TAKE = "QUIZ_TAKE";
    public static final String QUIZ_VIEW_RESULTS = "QUIZ_VIEW_RESULTS";

    // ========================================
    // CERTIFICATE MODULE
    // ========================================
    public static final String CERTIFICATE_VIEW = "CERTIFICATE_VIEW";
    public static final String CERTIFICATE_VIEW_ALL = "CERTIFICATE_VIEW_ALL";
    public static final String CERTIFICATE_CREATE = "CERTIFICATE_CREATE";
    public static final String CERTIFICATE_EDIT = "CERTIFICATE_EDIT";
    public static final String CERTIFICATE_DELETE = "CERTIFICATE_DELETE";
    public static final String CERTIFICATE_VERIFY = "CERTIFICATE_VERIFY";

    // ========================================
    // ALLOCATION MODULE
    // ========================================
    public static final String ALLOCATION_VIEW = "ALLOCATION_VIEW";
    public static final String ALLOCATION_VIEW_ALL = "ALLOCATION_VIEW_ALL";
    public static final String ALLOCATION_CREATE = "ALLOCATION_CREATE";
    public static final String ALLOCATION_EDIT = "ALLOCATION_EDIT";
    public static final String ALLOCATION_DELETE = "ALLOCATION_DELETE";
    public static final String ALLOCATION_MANAGE = "ALLOCATION_MANAGE";

    // ========================================
    // REPORT MODULE
    // ========================================
    public static final String REPORT_VIEW = "REPORT_VIEW";
    public static final String REPORT_VIEW_ALL = "REPORT_VIEW_ALL";
    public static final String REPORT_GENERATE = "REPORT_GENERATE";
    public static final String REPORT_EXPORT = "REPORT_EXPORT";
    public static final String REPORT_SCHEDULE = "REPORT_SCHEDULE";

    // ========================================
    // FORECASTING MODULE
    // ========================================
    public static final String FORECASTING_VIEW = "FORECASTING_VIEW";
    public static final String FORECASTING_ANALYZE = "FORECASTING_ANALYZE";
    public static final String FORECASTING_EXPORT = "FORECASTING_EXPORT";

    // ========================================
    // USER MANAGEMENT MODULE
    // ========================================
    public static final String USER_VIEW = "USER_VIEW";
    public static final String USER_CREATE = "USER_CREATE";
    public static final String USER_EDIT = "USER_EDIT";
    public static final String USER_DELETE = "USER_DELETE";
    public static final String USER_MANAGE = "USER_MANAGE";
    public static final String USER_RESET_PASSWORD = "USER_RESET_PASSWORD";
    public static final String USER_TOGGLE_STATUS = "USER_TOGGLE_STATUS";

    // ========================================
    // ROLE & PERMISSION MODULE
    // ========================================
    public static final String ROLE_VIEW = "ROLE_VIEW";
    public static final String ROLE_MANAGE = "ROLE_MANAGE";
    public static final String PERMISSION_VIEW = "PERMISSION_VIEW";
    public static final String PERMISSION_ASSIGN = "PERMISSION_ASSIGN";

    // ========================================
    // INTEGRATION MODULE (ZOHO)
    // ========================================
    public static final String INTEGRATION_VIEW = "INTEGRATION_VIEW";
    public static final String INTEGRATION_CONNECT = "INTEGRATION_CONNECT";
    public static final String INTEGRATION_DISCONNECT = "INTEGRATION_DISCONNECT";
    public static final String INTEGRATION_SYNC = "INTEGRATION_SYNC";
    public static final String INTEGRATION_IMPORT = "INTEGRATION_IMPORT";
    public static final String INTEGRATION_CONFIGURE = "INTEGRATION_CONFIGURE";

    // ========================================
    // LEAVE MODULE
    // ========================================
    public static final String LEAVE_VIEW = "LEAVE_VIEW";
    public static final String LEAVE_VIEW_ALL = "LEAVE_VIEW_ALL";
    public static final String LEAVE_CREATE = "LEAVE_CREATE";
    public static final String LEAVE_APPROVE = "LEAVE_APPROVE";
    public static final String LEAVE_REJECT = "LEAVE_REJECT";
    public static final String LEAVE_MANAGE = "LEAVE_MANAGE";

    // ========================================
    // SETTINGS MODULE
    // ========================================
    public static final String SETTINGS_VIEW = "SETTINGS_VIEW";
    public static final String SETTINGS_MANAGE = "SETTINGS_MANAGE";
    public static final String SETTINGS_SYSTEM = "SETTINGS_SYSTEM";

    // ========================================
    // AUDIT MODULE
    // ========================================
    public static final String AUDIT_VIEW = "AUDIT_VIEW";
    public static final String AUDIT_EXPORT = "AUDIT_EXPORT";
}
