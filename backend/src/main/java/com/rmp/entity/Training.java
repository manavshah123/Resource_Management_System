package com.rmp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "trainings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Training extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Category category = Category.TECHNICAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Difficulty difficulty = Difficulty.BEGINNER;

    @Column(name = "duration_hours")
    private Integer durationHours;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "attachment_url")
    private String attachmentUrl;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "external_link")
    private String externalLink;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @ManyToMany
    @JoinTable(
        name = "training_skills",
        joinColumns = @JoinColumn(name = "training_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private Set<Skill> relatedSkills = new HashSet<>();

    @OneToMany(mappedBy = "training", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<TrainingAssignment> assignments = new HashSet<>();

    @OneToMany(mappedBy = "training", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<TrainingModule> modules = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @Column(name = "total_modules")
    @Builder.Default
    private Integer totalModules = 0;

    public enum Category {
        TECHNICAL,
        SOFT_SKILL,
        DOMAIN,
        COMPLIANCE,
        LEADERSHIP,
        CERTIFICATION,
        ONBOARDING
    }

    public enum Difficulty {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED,
        EXPERT
    }

    public enum Status {
        DRAFT,
        ACTIVE,
        ARCHIVED
    }

    public void addSkill(Skill skill) {
        this.relatedSkills.add(skill);
    }

    public void removeSkill(Skill skill) {
        this.relatedSkills.remove(skill);
    }
}

