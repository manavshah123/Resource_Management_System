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
public class ZohoUserDto {

    @JsonProperty("id")
    private String id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("email")
    private String email;

    @JsonProperty("role")
    private String role;

    @JsonProperty("active")
    private Boolean active;

    @JsonProperty("zpuid")
    private String zpuid;

    // Additional fields from Zoho
    @JsonProperty("profile_url")
    private String profileUrl;

    // Flag to indicate if user is already imported to RMP
    @Builder.Default
    private Boolean imported = false;

    // Matched employee ID if imported
    private Long matchedEmployeeId;
}

