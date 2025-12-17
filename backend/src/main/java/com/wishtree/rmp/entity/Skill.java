package com.wishtree.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private String category;

    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<EmployeeSkill> employeeSkills = new HashSet<>();

    @ManyToMany(mappedBy = "requiredSkills")
    @Builder.Default
    private Set<Project> projects = new HashSet<>();

    public int getEmployeeCount() {
        return employeeSkills.size();
    }
}
