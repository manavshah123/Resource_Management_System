package com.rmp.service;

import com.rmp.dto.PermissionDto;
import com.rmp.dto.RolePermissionDto;
import com.rmp.entity.Permission;
import com.rmp.entity.RolePermission;
import com.rmp.entity.User;
import com.rmp.repository.PermissionRepository;
import com.rmp.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RolePermissionService {

    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    /**
     * Get all available permissions
     */
    public List<PermissionDto> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .filter(Permission::getIsActive)
                .map(PermissionDto::fromEntity)
                .sorted(Comparator.comparing(PermissionDto::getModule)
                        .thenComparing(PermissionDto::getCode))
                .collect(Collectors.toList());
    }

    /**
     * Get permissions grouped by module
     */
    public List<RolePermissionDto.ModulePermissions> getPermissionsByModule() {
        List<Permission> allPermissions = permissionRepository.findAll().stream()
                .filter(Permission::getIsActive)
                .sorted(Comparator.comparing(Permission::getModule)
                        .thenComparing(Permission::getCode))
                .collect(Collectors.toList());

        Map<String, List<Permission>> groupedByModule = allPermissions.stream()
                .collect(Collectors.groupingBy(Permission::getModule, LinkedHashMap::new, Collectors.toList()));

        return groupedByModule.entrySet().stream()
                .map(entry -> RolePermissionDto.ModulePermissions.builder()
                        .module(entry.getKey())
                        .permissions(entry.getValue().stream()
                                .map(PermissionDto::fromEntity)
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Get permissions for a specific role
     */
    public RolePermissionDto getRolePermissions(User.Role role) {
        List<RolePermission> rolePermissions = rolePermissionRepository.findByRole(role);
        List<PermissionDto> permissions = rolePermissions.stream()
                .map(rp -> PermissionDto.fromEntity(rp.getPermission()))
                .sorted(Comparator.comparing(PermissionDto::getModule)
                        .thenComparing(PermissionDto::getCode))
                .collect(Collectors.toList());

        return RolePermissionDto.builder()
                .role(role)
                .roleName(getRoleName(role))
                .roleDescription(getRoleDescription(role))
                .permissions(permissions)
                .permissionCount(permissions.size())
                .build();
    }

    /**
     * Get all roles with their permissions
     */
    public List<RolePermissionDto> getAllRolePermissions() {
        return Arrays.stream(User.Role.values())
                .map(this::getRolePermissions)
                .collect(Collectors.toList());
    }

    /**
     * Get complete permission matrix
     */
    public RolePermissionDto.RolePermissionMatrix getPermissionMatrix() {
        return RolePermissionDto.RolePermissionMatrix.builder()
                .roles(Arrays.asList(User.Role.values()))
                .modules(getPermissionsByModule())
                .rolePermissions(getAllRolePermissions())
                .build();
    }

    /**
     * Update permissions for a role
     */
    @Transactional
    public RolePermissionDto updateRolePermissions(User.Role role, Set<String> permissionCodes) {
        if (role == User.Role.ADMIN) {
            throw new IllegalArgumentException("Cannot modify ADMIN role permissions");
        }

        // Delete existing permissions for the role
        rolePermissionRepository.deleteByRole(role);

        // Add new permissions
        for (String code : permissionCodes) {
            permissionRepository.findByCode(code).ifPresent(permission -> {
                RolePermission rp = RolePermission.builder()
                        .role(role)
                        .permission(permission)
                        .build();
                rolePermissionRepository.save(rp);
            });
        }

        log.info("Updated {} permissions for role {}", permissionCodes.size(), role);
        return getRolePermissions(role);
    }

    /**
     * Add a permission to a role
     */
    @Transactional
    public void addPermissionToRole(User.Role role, String permissionCode) {
        if (role == User.Role.ADMIN) {
            throw new IllegalArgumentException("Cannot modify ADMIN role permissions");
        }

        Permission permission = permissionRepository.findByCode(permissionCode)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found: " + permissionCode));

        // Check if already exists
        if (rolePermissionRepository.findByRoleAndPermission(role, permission).isEmpty()) {
            RolePermission rp = RolePermission.builder()
                    .role(role)
                    .permission(permission)
                    .build();
            rolePermissionRepository.save(rp);
            log.info("Added permission {} to role {}", permissionCode, role);
        }
    }

    /**
     * Remove a permission from a role
     */
    @Transactional
    public void removePermissionFromRole(User.Role role, String permissionCode) {
        if (role == User.Role.ADMIN) {
            throw new IllegalArgumentException("Cannot modify ADMIN role permissions");
        }

        Permission permission = permissionRepository.findByCode(permissionCode)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found: " + permissionCode));

        rolePermissionRepository.findByRoleAndPermission(role, permission)
                .ifPresent(rolePermissionRepository::delete);
        log.info("Removed permission {} from role {}", permissionCode, role);
    }

    /**
     * Check if a role has a specific permission
     */
    public boolean hasPermission(User.Role role, String permissionCode) {
        return rolePermissionRepository.existsByRoleAndPermission_Code(role, permissionCode);
    }

    /**
     * Get all permission codes for a role
     */
    public Set<String> getPermissionCodes(User.Role role) {
        return rolePermissionRepository.findByRole(role).stream()
                .map(rp -> rp.getPermission().getCode())
                .collect(Collectors.toSet());
    }

    private String getRoleName(User.Role role) {
        return switch (role) {
            case ADMIN -> "Administrator";
            case PM -> "Project Manager";
            case HR -> "Human Resources";
            case EMPLOYEE -> "Employee";
        };
    }

    private String getRoleDescription(User.Role role) {
        return switch (role) {
            case ADMIN -> "Full system access with all permissions";
            case PM -> "Manages projects, allocations, and team resources";
            case HR -> "Manages employees, training, skills, and certifications";
            case EMPLOYEE -> "Basic access to own profile, trainings, and assigned tasks";
        };
    }
}

