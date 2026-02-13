package com.rmp.service;

import com.rmp.dto.CreateUserRequest;
import com.rmp.dto.PermissionDto;
import com.rmp.dto.UserDto;
import com.rmp.entity.Employee;
import com.rmp.entity.Permission;
import com.rmp.entity.RolePermission;
import com.rmp.entity.User;
import com.rmp.exceptions.BadRequestException;
import com.rmp.exceptions.ResourceNotFoundException;
import com.rmp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserManagementService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PasswordEncoder passwordEncoder;

    // User management
    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserDto::fromEntity);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        Set<String> permissions = getPermissionsForUser(user);
        return UserDto.fromEntityWithPermissions(user, permissions);
    }

    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        Set<String> permissions = getPermissionsForUser(user);
        return UserDto.fromEntityWithPermissions(user, permissions);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use: " + request.getEmail());
        }

        // Create User
        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(request.getEnabled() != null ? request.getEnabled() : true)
                .build();

        // Assign roles
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (String roleName : request.getRoles()) {
                try {
                    User.Role role = User.Role.valueOf(roleName);
                    user.addRole(role);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid role: {}", roleName);
                }
            }
        } else {
            user.addRole(User.Role.EMPLOYEE);
        }

        User savedUser = userRepository.save(user);

        // Create Employee automatically with the User
        Employee employee = Employee.builder()
                .employeeId(generateEmployeeId())
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .department(request.getDepartment() != null ? request.getDepartment() : "General")
                .designation(request.getDesignation() != null ? request.getDesignation() : "Employee")
                .location(request.getLocation())
                .joinDate(request.getJoinDate() != null ? request.getJoinDate() : java.time.LocalDate.now())
                .maxFTE(request.getMaxFTE() != null ? request.getMaxFTE() : 1.0)
                .status(Employee.Status.ACTIVE)
                .availabilityStatus(Employee.AvailabilityStatus.AVAILABLE)
                .user(savedUser)
                .build();

        // Set manager if provided
        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElse(null);
            employee.setManager(manager);
        }

        Employee savedEmployee = employeeRepository.save(employee);
        savedUser.setEmployee(savedEmployee);
        userRepository.save(savedUser);

        log.info("Created user: {} with employee ID: {} and roles: {}", 
                savedUser.getEmail(), savedEmployee.getEmployeeId(), savedUser.getRoles());
        return UserDto.fromEntity(savedUser);
    }

    private String generateEmployeeId() {
        long count = employeeRepository.count() + 1;
        return String.format("EMP%05d", count);
    }

    @Transactional
    public UserDto updateUser(Long id, CreateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use: " + request.getEmail());
        }

        // Update User
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        // Update roles
        if (request.getRoles() != null) {
            user.getRoles().clear();
            for (String roleName : request.getRoles()) {
                try {
                    User.Role role = User.Role.valueOf(roleName);
                    user.addRole(role);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid role: {}", roleName);
                }
            }
        }

        // Update linked Employee
        Employee employee = user.getEmployee();
        if (employee != null) {
            employee.setName(request.getName());
            employee.setEmail(request.getEmail());
            employee.setPhone(request.getPhone());
            if (request.getDepartment() != null) employee.setDepartment(request.getDepartment());
            if (request.getDesignation() != null) employee.setDesignation(request.getDesignation());
            if (request.getLocation() != null) employee.setLocation(request.getLocation());
            if (request.getJoinDate() != null) employee.setJoinDate(request.getJoinDate());
            if (request.getMaxFTE() != null) employee.setMaxFTE(request.getMaxFTE());

            // Update manager if provided
            if (request.getManagerId() != null) {
                Employee manager = employeeRepository.findById(request.getManagerId())
                        .orElse(null);
                employee.setManager(manager);
            }

            employeeRepository.save(employee);
        }

        User savedUser = userRepository.save(user);
        log.info("Updated user: {}", savedUser.getEmail());
        return UserDto.fromEntity(savedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
        log.info("Deleted user: {}", user.getEmail());
    }

    @Transactional
    public void toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        log.info("Toggled user status: {} -> {}", user.getEmail(), user.isEnabled());
    }

    @Transactional
    public UserDto assignRoles(Long userId, Set<String> roleNames) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.getRoles().clear();
        for (String roleName : roleNames) {
            try {
                User.Role role = User.Role.valueOf(roleName);
                user.addRole(role);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role: {}", roleName);
            }
        }

        User savedUser = userRepository.save(user);
        log.info("Assigned roles {} to user {}", roleNames, user.getEmail());
        return UserDto.fromEntity(savedUser);
    }

    // Permission management
    public List<PermissionDto> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(PermissionDto::fromEntity)
                .collect(Collectors.toList());
    }

    public Map<String, List<PermissionDto>> getPermissionsByModule() {
        return permissionRepository.findAll().stream()
                .map(PermissionDto::fromEntity)
                .collect(Collectors.groupingBy(PermissionDto::getModule));
    }

    public Set<String> getPermissionsForRole(String roleName) {
        User.Role role = User.Role.valueOf(roleName);
        return rolePermissionRepository.findPermissionCodesByRole(role);
    }

    public Set<String> getPermissionsForUser(User user) {
        return rolePermissionRepository.findPermissionCodesByRoles(user.getRoles());
    }

    public Map<String, Set<String>> getAllRolePermissions() {
        Map<String, Set<String>> result = new HashMap<>();
        for (User.Role role : User.Role.values()) {
            Set<String> permissions = rolePermissionRepository.findPermissionCodesByRole(role);
            result.put(role.name(), permissions);
        }
        return result;
    }

    @Transactional
    public void assignPermissionsToRole(String roleName, Set<String> permissionCodes) {
        User.Role role = User.Role.valueOf(roleName);
        
        // Remove existing permissions
        List<RolePermission> existing = rolePermissionRepository.findByRole(role);
        rolePermissionRepository.deleteAll(existing);
        
        // Add new permissions
        for (String code : permissionCodes) {
            Permission permission = permissionRepository.findByCode(code)
                    .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + code));
            
            RolePermission rp = RolePermission.builder()
                    .role(role)
                    .permission(permission)
                    .build();
            rolePermissionRepository.save(rp);
        }
        
        log.info("Assigned {} permissions to role {}", permissionCodes.size(), roleName);
    }

    // Get available roles
    public List<Map<String, Object>> getAvailableRoles() {
        List<Map<String, Object>> roles = new ArrayList<>();
        for (User.Role role : User.Role.values()) {
            Map<String, Object> roleInfo = new HashMap<>();
            roleInfo.put("code", role.name());
            roleInfo.put("name", formatRoleName(role.name()));
            roleInfo.put("description", getRoleDescription(role));
            roles.add(roleInfo);
        }
        return roles;
    }

    private String formatRoleName(String roleName) {
        return roleName.substring(0, 1).toUpperCase() + roleName.substring(1).toLowerCase().replace("_", " ");
    }

    private String getRoleDescription(User.Role role) {
        return switch (role) {
            case ADMIN -> "Full system access, can manage all users and settings";
            case PM -> "Project Manager - Can manage projects and allocations";
            case HR -> "HR Manager - Can manage employees and trainings";
            case EMPLOYEE -> "Regular employee - Limited access to personal data";
        };
    }

    // Stats
    public Map<String, Long> getUserStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", userRepository.count());
        stats.put("active", userRepository.countByEnabledTrue());
        stats.put("inactive", userRepository.countByEnabledFalse());
        return stats;
    }
}

