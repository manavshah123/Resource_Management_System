package com.wishtree.rmp.repository;

import com.wishtree.rmp.entity.RolePermission;
import com.wishtree.rmp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    List<RolePermission> findByRole(User.Role role);

    @Query("SELECT rp.permission.code FROM RolePermission rp WHERE rp.role = :role")
    Set<String> findPermissionCodesByRole(@Param("role") User.Role role);

    @Query("SELECT rp.permission.code FROM RolePermission rp WHERE rp.role IN :roles")
    Set<String> findPermissionCodesByRoles(@Param("roles") Set<User.Role> roles);

    void deleteByRoleAndPermissionId(User.Role role, Long permissionId);

    boolean existsByRoleAndPermissionCode(User.Role role, String permissionCode);
}

