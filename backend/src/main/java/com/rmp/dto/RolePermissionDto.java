package com.rmp.dto;

import com.rmp.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolePermissionDto {
    
    private User.Role role;
    private String roleName;
    private String roleDescription;
    private List<PermissionDto> permissions;
    private int permissionCount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RolePermissionUpdateRequest {
        private User.Role role;
        private Set<String> permissionCodes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModulePermissions {
        private String module;
        private List<PermissionDto> permissions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RolePermissionMatrix {
        private List<User.Role> roles;
        private List<ModulePermissions> modules;
        private List<RolePermissionDto> rolePermissions;
    }
}

