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
public class ZohoTimesheetDto {
    
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("name")
    private String taskName;
    
    @JsonProperty("task_name")
    private String task;
    
    @JsonProperty("project_name")
    private String projectName;
    
    @JsonProperty("project_id")
    private String projectId;
    
    @JsonProperty("task_id")
    private String taskId;
    
    @JsonProperty("owner_name")
    private String ownerName;
    
    @JsonProperty("owner_id")
    private String ownerId;
    
    @JsonProperty("log_date")
    private String logDate;
    
    @JsonProperty("log_date_long")
    private Long logDateLong;
    
    @JsonProperty("hours")
    private String hours;
    
    @JsonProperty("hours_display")
    private String hoursDisplay;
    
    @JsonProperty("total_minutes")
    private Integer totalMinutes;
    
    @JsonProperty("bill_status")
    private String billStatus;
    
    @JsonProperty("notes")
    private String notes;
    
    @JsonProperty("approval_status")
    private String approvalStatus;
    
    @JsonProperty("created_time")
    private String createdTime;
    
    @JsonProperty("created_time_long")
    private Long createdTimeLong;
}

