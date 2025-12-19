package com.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity to store application settings including Zoho configuration and branding.
 * Uses a key-value pattern with categories for organization.
 */
@Entity
@Table(name = "app_settings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"category", "setting_key"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppSettings extends BaseEntity {

    @Column(nullable = false)
    private String category;

    @Column(name = "setting_key", nullable = false)
    private String key;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String value;

    @Column(name = "display_name")
    private String displayName;

    private String description;

    @Column(name = "value_type")
    @Builder.Default
    private String valueType = "STRING"; // STRING, BOOLEAN, NUMBER, SECRET, JSON

    @Column(name = "is_secret")
    @Builder.Default
    private Boolean isSecret = false;

    @Column(name = "is_required")
    @Builder.Default
    private Boolean isRequired = false;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    // Categories
    public static final String CATEGORY_BRANDING = "BRANDING";
    public static final String CATEGORY_ZOHO = "ZOHO";
    public static final String CATEGORY_EMAIL = "EMAIL";
    public static final String CATEGORY_GENERAL = "GENERAL";
    public static final String CATEGORY_SECURITY = "SECURITY";

    // Branding Keys
    public static final String KEY_APP_NAME = "APP_NAME";
    public static final String KEY_APP_LOGO = "APP_LOGO";
    public static final String KEY_APP_FAVICON = "APP_FAVICON";
    public static final String KEY_THEME_ID = "THEME_ID";
    public static final String KEY_COMPANY_NAME = "COMPANY_NAME";
    public static final String KEY_SUPPORT_EMAIL = "SUPPORT_EMAIL";
    public static final String KEY_COPYRIGHT_TEXT = "COPYRIGHT_TEXT";

    // Zoho Keys
    public static final String KEY_ZOHO_ENABLED = "ZOHO_ENABLED";
    public static final String KEY_ZOHO_CLIENT_ID = "ZOHO_CLIENT_ID";
    public static final String KEY_ZOHO_CLIENT_SECRET = "ZOHO_CLIENT_SECRET";
    public static final String KEY_ZOHO_REDIRECT_URI = "ZOHO_REDIRECT_URI";
    public static final String KEY_ZOHO_AUTH_URL = "ZOHO_AUTH_URL";
    public static final String KEY_ZOHO_TOKEN_URL = "ZOHO_TOKEN_URL";
    public static final String KEY_ZOHO_API_BASE_URL = "ZOHO_API_BASE_URL";
    public static final String KEY_ZOHO_PEOPLE_API_BASE_URL = "ZOHO_PEOPLE_API_BASE_URL";
    public static final String KEY_ZOHO_SCOPES = "ZOHO_SCOPES";
}

