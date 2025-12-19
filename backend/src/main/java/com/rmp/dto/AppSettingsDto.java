package com.rmp.dto;

import com.rmp.entity.AppSettings;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppSettingsDto {

    private Long id;
    private String category;
    private String key;
    private String value;
    private String displayName;
    private String description;
    private String valueType;
    private Boolean isSecret;
    private Boolean isRequired;
    private Integer displayOrder;

    public static AppSettingsDto fromEntity(AppSettings entity) {
        return AppSettingsDto.builder()
                .id(entity.getId())
                .category(entity.getCategory())
                .key(entity.getKey())
                .value(entity.getIsSecret() ? "********" : entity.getValue())
                .displayName(entity.getDisplayName())
                .description(entity.getDescription())
                .valueType(entity.getValueType())
                .isSecret(entity.getIsSecret())
                .isRequired(entity.getIsRequired())
                .displayOrder(entity.getDisplayOrder())
                .build();
    }

    // Response DTOs
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySettings {
        private String category;
        private String categoryDisplayName;
        private List<AppSettingsDto> settings;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AllSettings {
        private List<CategorySettings> categories;
    }

    // Request DTOs
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateSettingRequest {
        private String category;
        private String key;
        private String value;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkUpdateRequest {
        private List<UpdateSettingRequest> settings;
    }

    // Branding specific DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BrandingConfig {
        private String appName;
        private String appLogo;
        private String appFavicon;
        private String primaryColor;
        private String secondaryColor;
        private String companyName;
        private String supportEmail;
        private String copyrightText;
    }

    // Zoho specific DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ZohoConfig {
        private Boolean enabled;
        private String clientId;
        private String clientSecret;
        private String redirectUri;
        private String authUrl;
        private String tokenUrl;
        private String apiBaseUrl;
        private String peopleApiBaseUrl;
        private String scopes;
    }
}

