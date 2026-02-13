package com.rmp.controller;

import com.rmp.dto.PermissionDto;
import com.rmp.dto.RolePermissionDto;
import com.rmp.entity.User;
import com.rmp.service.RolePermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/roles-permissions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Role & Permission Management", description = "APIs for managing roles and permissions")
public class RolePermissionController {

    private final RolePermissionService rolePermissionService;

    // ========================================
    // PERMISSION ENDPOINTS
    // ========================================

    @GetMapping("/permissions")
    @Operation(summary = "Get all permissions", description = "Returns all available permissions in the system")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<PermissionDto>> getAllPermissions() {
        return ResponseEntity.ok(rolePermissionService.getAllPermissions());
    }

    @GetMapping("/permissions/by-module")
    @Operation(summary = "Get permissions grouped by module", description = "Returns permissions organized by their module")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<RolePermissionDto.ModulePermissions>> getPermissionsByModule() {
        return ResponseEntity.ok(rolePermissionService.getPermissionsByModule());
    }

    // ========================================
    // ROLE ENDPOINTS
    // ========================================

    @GetMapping("/roles")
    @Operation(summary = "Get all roles", description = "Returns all available roles in the system")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<User.Role>> getAllRoles() {
        return ResponseEntity.ok(List.of(User.Role.values()));
    }

    @GetMapping("/roles/{role}")
    @Operation(summary = "Get role details with permissions", description = "Returns role information including assigned permissions")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<RolePermissionDto> getRolePermissions(@PathVariable User.Role role) {
        return ResponseEntity.ok(rolePermissionService.getRolePermissions(role));
    }

    @GetMapping("/roles/all")
    @Operation(summary = "Get all roles with their permissions", description = "Returns all roles with their assigned permissions")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<RolePermissionDto>> getAllRolePermissions() {
        return ResponseEntity.ok(rolePermissionService.getAllRolePermissions());
    }

    // ========================================
    // PERMISSION MATRIX
    // ========================================

    @GetMapping("/matrix")
    @Operation(summary = "Get permission matrix", description = "Returns complete role-permission matrix for all roles and modules")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<RolePermissionDto.RolePermissionMatrix> getPermissionMatrix() {
        return ResponseEntity.ok(rolePermissionService.getPermissionMatrix());
    }

    // ========================================
    // ROLE PERMISSION MANAGEMENT (ADMIN ONLY)
    // ========================================

    @PutMapping("/roles/{role}")
    @Operation(summary = "Update role permissions", description = "Replace all permissions for a role with the provided set")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RolePermissionDto> updateRolePermissions(
            @PathVariable User.Role role,
            @RequestBody RolePermissionDto.RolePermissionUpdateRequest request) {
        return ResponseEntity.ok(rolePermissionService.updateRolePermissions(role, request.getPermissionCodes()));
    }

    @PostMapping("/roles/{role}/permissions/{permissionCode}")
    @Operation(summary = "Add permission to role", description = "Add a single permission to a role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> addPermissionToRole(
            @PathVariable User.Role role,
            @PathVariable String permissionCode) {
        rolePermissionService.addPermissionToRole(role, permissionCode);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/roles/{role}/permissions/{permissionCode}")
    @Operation(summary = "Remove permission from role", description = "Remove a single permission from a role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removePermissionFromRole(
            @PathVariable User.Role role,
            @PathVariable String permissionCode) {
        rolePermissionService.removePermissionFromRole(role, permissionCode);
        return ResponseEntity.ok().build();
    }

    // ========================================
    // PERMISSION CHECK ENDPOINTS
    // ========================================

    @GetMapping("/roles/{role}/has-permission/{permissionCode}")
    @Operation(summary = "Check if role has permission", description = "Check if a specific role has a specific permission")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PM')")
    public ResponseEntity<Boolean> hasPermission(
            @PathVariable User.Role role,
            @PathVariable String permissionCode) {
        return ResponseEntity.ok(rolePermissionService.hasPermission(role, permissionCode));
    }

    @GetMapping("/roles/{role}/permission-codes")
    @Operation(summary = "Get permission codes for role", description = "Returns all permission codes assigned to a role")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Set<String>> getPermissionCodes(@PathVariable User.Role role) {
        return ResponseEntity.ok(rolePermissionService.getPermissionCodes(role));
    }
}

