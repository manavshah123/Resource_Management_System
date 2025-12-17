package com.rmp.dto;

import com.rmp.entity.SkillCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillCategoryDto {

    private Long id;
    private String name;
    private String code;
    private String description;
    private String color;
    private Integer displayOrder;
    private Boolean isActive;
    private Integer skillCount;

    public static SkillCategoryDto fromEntity(SkillCategory entity) {
        return SkillCategoryDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .description(entity.getDescription())
                .color(entity.getColor())
                .displayOrder(entity.getDisplayOrder())
                .isActive(entity.getIsActive())
                .build();
    }

    public static SkillCategoryDto fromEntityWithCount(SkillCategory entity, int skillCount) {
        SkillCategoryDto dto = fromEntity(entity);
        dto.setSkillCount(skillCount);
        return dto;
    }
}

