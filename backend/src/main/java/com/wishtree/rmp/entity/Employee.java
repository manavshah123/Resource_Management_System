package com.wishtree.rmp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE employees SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Employee extends BaseEntity {

    @Column(name = "employee_id", nullable = false, unique = true)
    private String employeeId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    private String department;

    private String designation;

    private String location;

    @Column(name = "join_date")
    private LocalDate joinDate;

    // Maximum FTE (Full-Time Equivalent) capacity (1 FTE = 8 hours/day, default 1.0)
    @Column(name = "max_fte")
    @Builder.Default
    private Double maxFTE = 1.0;

    // Soft delete timestamp
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status")
    @Builder.Default
    private AvailabilityStatus availabilityStatus = AvailabilityStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @OneToMany(mappedBy = "manager")
    @Builder.Default
    private Set<Employee> directReports = new HashSet<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<EmployeeSkill> skills = new HashSet<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Allocation> allocations = new HashSet<>();

    private String bio;

    private String avatar;

    public void addSkill(EmployeeSkill skill) {
        this.skills.add(skill);
    }

    public void removeSkill(EmployeeSkill skill) {
        this.skills.remove(skill);
    }

    // Get current FTE allocation (sum of all active allocations)
    public Double getCurrentFTE() {
        return allocations.stream()
            .filter(a -> a.getStatus() == Allocation.Status.ACTIVE)
            .mapToDouble(a -> a.getFte() != null ? a.getFte() : 0)
            .sum();
    }
    
    // Get current allocation as percentage (for backward compatibility)
    public int getCurrentAllocation() {
        return (int)(getCurrentFTE() * 100);
    }

    // Get remaining available FTE
    public Double getAvailableFTE() {
        double currentFTE = getCurrentFTE();
        return Math.max(0, maxFTE - currentFTE);
    }
    
    // Get available hours per day
    public Double getAvailableHoursPerDay() {
        return getAvailableFTE() * 8;
    }

    // Check if employee can be allocated with given FTE
    public boolean canAllocate(Double fte) {
        return getAvailableFTE() >= fte;
    }
    
    // Check if employee can be allocated with given percentage (backward compatibility)
    public boolean canAllocatePercentage(int percentage) {
        return canAllocate(percentage / 100.0);
    }

    public enum Status {
        ACTIVE,
        INACTIVE,
        ON_LEAVE,
        TERMINATED
    }

    public enum AvailabilityStatus {
        AVAILABLE,      // Can be assigned to projects
        PARTIALLY_AVAILABLE, // Has some allocation but not full
        FULLY_ALLOCATED, // At 100% allocation
        ON_LEAVE,       // On leave
        UNAVAILABLE     // Not available for projects
    }
}

