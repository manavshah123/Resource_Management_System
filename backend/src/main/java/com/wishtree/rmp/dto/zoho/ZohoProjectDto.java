package com.wishtree.rmp.dto.zoho;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ZohoProjectDto {

    @JsonProperty("id")
    private String id;

    @JsonProperty("id_string")
    private String idString;

    @JsonProperty("name")
    private String name;

    @JsonProperty("description")
    private String description;

    @JsonProperty("status")
    private String status;

    @JsonProperty("owner_name")
    private String ownerName;

    @JsonProperty("owner_id")
    private String ownerId;

    @JsonProperty("start_date")
    private String startDate;

    @JsonProperty("start_date_format")
    private String startDateFormat;

    @JsonProperty("end_date")
    private String endDate;

    @JsonProperty("end_date_format")
    private String endDateFormat;

    @JsonProperty("created_date")
    private String createdDate;

    @JsonProperty("created_date_format")
    private String createdDateFormat;

    @JsonProperty("task_count")
    private ZohoTaskCount taskCount;

    @JsonProperty("milestone_count")
    private ZohoMilestoneCount milestoneCount;

    @JsonProperty("bug_count")
    private ZohoBugCount bugCount;

    @JsonProperty("group_name")
    private String groupName;

    @JsonProperty("group_id")
    private String groupId;

    @JsonProperty("IS_BUG_ENABLED")
    private Boolean isBugEnabled;

    @JsonProperty("link")
    private ZohoLink link;

    // Whether this project is already imported to RMP
    @Builder.Default
    private Boolean imported = false;
    
    // The RMP project ID if imported
    private Long rmpProjectId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ZohoTaskCount {
        @JsonProperty("open")
        private Integer open;
        @JsonProperty("closed")
        private Integer closed;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ZohoMilestoneCount {
        @JsonProperty("open")
        private Integer open;
        @JsonProperty("closed")
        private Integer closed;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ZohoBugCount {
        @JsonProperty("open")
        private Integer open;
        @JsonProperty("closed")
        private Integer closed;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ZohoLink {
        @JsonProperty("self")
        private ZohoLinkDetail self;
        @JsonProperty("activity")
        private ZohoLinkDetail activity;
        @JsonProperty("status")
        private ZohoLinkDetail status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ZohoLinkDetail {
        @JsonProperty("url")
        private String url;
    }
}

