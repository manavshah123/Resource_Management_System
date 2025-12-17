package com.wishtree.rmp.controller;

import com.wishtree.rmp.dto.CreateUserRequest;
import com.wishtree.rmp.dto.PermissionDto;
import com.wishtree.rmp.dto.UserDto;
import com.wishtree.rmp.service.UserManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "User and role management APIs")
public class UserManagementController {

    private final UserManagementService userManagementService;

    // User CRUD endpoints
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users with pagination")
    public ResponseEntity<Page<UserDto>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userManagementService.getAllUsers(pageable));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users")
    public ResponseEntity<List<UserDto>> getAllUsersList() {
        return ResponseEntity.ok(userManagementService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userManagementService.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new user")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userManagementService.createUser(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userManagementService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userManagementService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle user active status")
    public ResponseEntity<Void> toggleUserStatus(@PathVariable Long id) {
        userManagementService.toggleUserStatus(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign roles to user")
    public ResponseEntity<UserDto> assignRoles(
            @PathVariable Long id,
            @RequestBody Set<String> roles) {
        return ResponseEntity.ok(userManagementService.assignRoles(id, roles));
    }

    // Role endpoints
    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all available roles")
    public ResponseEntity<List<Map<String, Object>>> getAvailableRoles() {
        return ResponseEntity.ok(userManagementService.getAvailableRoles());
    }

    @GetMapping("/roles/{role}/permissions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get permissions for a role")
    public ResponseEntity<Set<String>> getRolePermissions(@PathVariable String role) {
        return ResponseEntity.ok(userManagementService.getPermissionsForRole(role));
    }

    @PutMapping("/roles/{role}/permissions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign permissions to a role")
    public ResponseEntity<Void> assignPermissionsToRole(
            @PathVariable String role,
            @RequestBody Set<String> permissionCodes) {
        userManagementService.assignPermissionsToRole(role, permissionCodes);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/roles/permissions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all role-permission mappings")
    public ResponseEntity<Map<String, Set<String>>> getAllRolePermissions() {
        return ResponseEntity.ok(userManagementService.getAllRolePermissions());
    }

    // Permission endpoints
    @GetMapping("/permissions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all permissions")
    public ResponseEntity<List<PermissionDto>> getAllPermissions() {
        return ResponseEntity.ok(userManagementService.getAllPermissions());
    }

    @GetMapping("/permissions/by-module")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get permissions grouped by module")
    public ResponseEntity<Map<String, List<PermissionDto>>> getPermissionsByModule() {
        return ResponseEntity.ok(userManagementService.getPermissionsByModule());
    }

    // Stats
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user statistics")
    public ResponseEntity<Map<String, Long>> getUserStats() {
        return ResponseEntity.ok(userManagementService.getUserStats());
    }

    // Get current user permissions (for any authenticated user)
    @GetMapping("/me/permissions")
    @Operation(summary = "Get current user's permissions")
    public ResponseEntity<UserDto> getCurrentUserPermissions() {
        // This will be handled by SecurityContext
        return ResponseEntity.ok().build();
    }
}

