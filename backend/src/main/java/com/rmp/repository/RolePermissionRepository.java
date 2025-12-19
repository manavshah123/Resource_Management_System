package com.rmp.repository;

import com.rmp.entity.Permission;
import com.rmp.entity.RolePermission;
import com.rmp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    List<RolePermission> findByRole(User.Role role);

    Optional<RolePermission> findByRoleAndPermission(User.Role role, Permission permission);

    @Query("SELECT rp.permission.code FROM RolePermission rp WHERE rp.role = :role")
    Set<String> findPermissionCodesByRole(@Param("role") User.Role role);

    @Query("SELECT rp.permission.code FROM RolePermission rp WHERE rp.role IN :roles")
    Set<String> findPermissionCodesByRoles(@Param("roles") Set<User.Role> roles);

    @Modifying
    void deleteByRole(User.Role role);

    void deleteByRoleAndPermissionId(User.Role role, Long permissionId);

    boolean existsByRoleAndPermissionCode(User.Role role, String permissionCode);

    @Query("SELECT CASE WHEN COUNT(rp) > 0 THEN true ELSE false END FROM RolePermission rp " +
           "WHERE rp.role = :role AND rp.permission.code = :code")
    boolean existsByRoleAndPermission_Code(@Param("role") User.Role role, @Param("code") String code);

    @Query("SELECT COUNT(rp) FROM RolePermission rp WHERE rp.role = :role")
    long countByRole(@Param("role") User.Role role);
}
