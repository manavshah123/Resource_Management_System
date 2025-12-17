package com.rmp.dto;

import com.rmp.entity.Skill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillDto {

    private Long id;
    private String name;
    private String description;
    private String category;
    private Integer employeeCount;

    public static SkillDto fromEntity(Skill skill) {
        return SkillDto.builder()
                .id(skill.getId())
                .name(skill.getName())
                .description(skill.getDescription())
                .category(skill.getCategory())
                .employeeCount(skill.getEmployeeCount())
                .build();
    }
}

