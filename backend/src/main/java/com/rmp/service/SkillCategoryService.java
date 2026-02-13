package com.rmp.service;

import com.rmp.dto.SkillCategoryDto;
import com.rmp.entity.SkillCategory;
import com.rmp.exceptions.BadRequestException;
import com.rmp.exceptions.ResourceNotFoundException;
import com.rmp.repository.SkillCategoryRepository;
import com.rmp.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SkillCategoryService {

    private final SkillCategoryRepository categoryRepository;
    private final SkillRepository skillRepository;

    public List<SkillCategoryDto> getAllCategories() {
        return categoryRepository.findAllOrdered().stream()
                .map(cat -> {
                    int count = skillRepository.countByCategory(cat.getCode());
                    return SkillCategoryDto.fromEntityWithCount(cat, count);
                })
                .collect(Collectors.toList());
    }

    public List<SkillCategoryDto> getActiveCategories() {
        return categoryRepository.findAllActive().stream()
                .map(cat -> {
                    int count = skillRepository.countByCategory(cat.getCode());
                    return SkillCategoryDto.fromEntityWithCount(cat, count);
                })
                .collect(Collectors.toList());
    }

    public SkillCategoryDto getCategoryById(Long id) {
        SkillCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        int count = skillRepository.countByCategory(category.getCode());
        return SkillCategoryDto.fromEntityWithCount(category, count);
    }

    public SkillCategoryDto getCategoryByCode(String code) {
        SkillCategory category = categoryRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with code: " + code));
        return SkillCategoryDto.fromEntity(category);
    }

    @Transactional
    public SkillCategoryDto createCategory(SkillCategoryDto dto) {
        String code = dto.getCode() != null ? dto.getCode() : 
                      dto.getName().toUpperCase().replace(" ", "_");

        if (categoryRepository.existsByCode(code)) {
            throw new BadRequestException("Category with code " + code + " already exists");
        }

        if (categoryRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Category with name " + dto.getName() + " already exists");
        }

        SkillCategory category = SkillCategory.builder()
                .name(dto.getName())
                .code(code)
                .description(dto.getDescription())
                .color(dto.getColor() != null ? dto.getColor() : "#64748b")
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .isActive(true)
                .build();

        SkillCategory saved = categoryRepository.save(category);
        log.info("Created skill category: {}", saved.getName());
        return SkillCategoryDto.fromEntity(saved);
    }

    @Transactional
    public SkillCategoryDto updateCategory(Long id, SkillCategoryDto dto) {
        SkillCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (!category.getName().equals(dto.getName()) && categoryRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Category with name " + dto.getName() + " already exists");
        }

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        if (dto.getColor() != null) category.setColor(dto.getColor());
        if (dto.getDisplayOrder() != null) category.setDisplayOrder(dto.getDisplayOrder());
        if (dto.getIsActive() != null) category.setIsActive(dto.getIsActive());

        SkillCategory updated = categoryRepository.save(category);
        log.info("Updated skill category: {}", updated.getName());
        return SkillCategoryDto.fromEntity(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        SkillCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        int skillCount = skillRepository.countByCategory(category.getCode());
        if (skillCount > 0) {
            throw new BadRequestException("Cannot delete category with " + skillCount + " skills. Move or delete skills first.");
        }

        categoryRepository.delete(category);
        log.info("Deleted skill category: {}", category.getName());
    }

    @Transactional
    public void toggleActive(Long id) {
        SkillCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        category.setIsActive(!category.getIsActive());
        categoryRepository.save(category);
    }
}

