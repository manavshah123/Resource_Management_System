package com.wishtree.rmp.service;

import com.wishtree.rmp.dto.SkillDto;
import com.wishtree.rmp.entity.Skill;
import com.wishtree.rmp.exceptions.BadRequestException;
import com.wishtree.rmp.exceptions.ResourceNotFoundException;
import com.wishtree.rmp.repository.SkillRepository;
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
public class SkillService {

    private final SkillRepository skillRepository;

    public List<SkillDto> getAllSkills() {
        return skillRepository.findAll()
                .stream()
                .map(SkillDto::fromEntity)
                .collect(Collectors.toList());
    }

    public SkillDto getSkillById(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));
        return SkillDto.fromEntity(skill);
    }

    public List<SkillDto> getSkillsByCategory(String category) {
        return skillRepository.findByCategory(category.toUpperCase())
                .stream()
                .map(SkillDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<SkillDto> searchSkills(String search) {
        return skillRepository.searchByName(search)
                .stream()
                .map(SkillDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public SkillDto createSkill(String name, String description, String category) {
        if (skillRepository.existsByName(name)) {
            throw new BadRequestException("Skill already exists: " + name);
        }

        Skill skill = Skill.builder()
                .name(name)
                .description(description)
                .category(category.toUpperCase())
                .build();

        Skill savedSkill = skillRepository.save(skill);
        log.info("Created skill: {}", savedSkill.getName());
        return SkillDto.fromEntity(savedSkill);
    }

    @Transactional
    public SkillDto updateSkill(Long id, String name, String description, String category) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));

        if (!skill.getName().equals(name) && skillRepository.existsByName(name)) {
            throw new BadRequestException("Skill already exists: " + name);
        }

        skill.setName(name);
        skill.setDescription(description);
        skill.setCategory(category.toUpperCase());

        Skill updatedSkill = skillRepository.save(skill);
        log.info("Updated skill: {}", updatedSkill.getName());
        return SkillDto.fromEntity(updatedSkill);
    }

    @Transactional
    public void deleteSkill(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));
        skillRepository.delete(skill);
        log.info("Deleted skill: {}", skill.getName());
    }

    public List<SkillDto> getMostUsedSkills(int limit) {
        return skillRepository.findMostUsedSkills()
                .stream()
                .limit(limit)
                .map(SkillDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<String> getAllCategories() {
        return skillRepository.findAllCategories();
    }

    public long getTotalCount() {
        return skillRepository.count();
    }
}
