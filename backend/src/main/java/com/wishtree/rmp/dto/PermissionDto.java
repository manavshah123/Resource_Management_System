package com.wishtree.rmp.dto;

import com.wishtree.rmp.entity.Permission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionDto {

    private Long id;
    private String code;
    private String name;
    private String description;
    private String module;
    private Boolean isActive;

    public static PermissionDto fromEntity(Permission entity) {
        return PermissionDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .module(entity.getModule())
                .isActive(entity.getIsActive())
                .build();
    }
}

