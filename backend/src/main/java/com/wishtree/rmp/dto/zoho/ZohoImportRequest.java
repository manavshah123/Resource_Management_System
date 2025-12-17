package com.wishtree.rmp.dto.zoho;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZohoImportRequest {

    private List<String> projectIds;
    
    // Optional: Map Zoho project owner to RMP employee
    private Long defaultManagerId;
    
    // Whether to update existing projects or skip them
    @Builder.Default
    private Boolean updateExisting = false;
}

