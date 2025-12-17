package com.rmp.dto.zoho;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ZohoPortalDto {

    @JsonProperty("id")
    private String id;

    @JsonProperty("id_string")
    private String idString;

    @JsonProperty("name")
    private String name;

    @JsonProperty("default")
    private Boolean isDefault;

    @JsonProperty("gmt_time_zone")
    private String gmtTimeZone;

    @JsonProperty("role")
    private String role;

    @JsonProperty("project_count")
    private ZohoProjectCount projectCount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ZohoProjectCount {
        @JsonProperty("active")
        private Integer active;
        @JsonProperty("template")
        private Integer template;
        @JsonProperty("archived")
        private Integer archived;
    }
}

