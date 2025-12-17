package com.wishtree.rmp.controller;

import com.wishtree.rmp.dto.SkillDto;
import com.wishtree.rmp.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/skills")
@RequiredArgsConstructor
@Tag(name = "Skills", description = "Skill management APIs")
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    @Operation(summary = "Get all skills", description = "Get list of all skills")
    public ResponseEntity<List<SkillDto>> getAllSkills() {
        return ResponseEntity.ok(skillService.getAllSkills());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get skill by ID", description = "Get single skill by ID")
    public ResponseEntity<SkillDto> getSkillById(@PathVariable Long id) {
        return ResponseEntity.ok(skillService.getSkillById(id));
    }

    @GetMapping("/by-category/{category}")
    @Operation(summary = "Get skills by category", description = "Get skills filtered by category")
    public ResponseEntity<List<SkillDto>> getSkillsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(skillService.getSkillsByCategory(category));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create skill", description = "Create a new skill")
    public ResponseEntity<SkillDto> createSkill(@RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(skillService.createSkill(body.get("name"), body.get("description"), body.get("category")));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update skill", description = "Update an existing skill")
    public ResponseEntity<SkillDto> updateSkill(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(skillService.updateSkill(id, body.get("name"), body.get("description"), body.get("category")));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Delete skill", description = "Delete a skill")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id) {
        skillService.deleteSkill(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categories")
    @Operation(summary = "Get skill categories", description = "Get list of all skill categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(skillService.getAllCategories());
    }

    @GetMapping("/most-used")
    @Operation(summary = "Get most used skills", description = "Get top N most used skills")
    public ResponseEntity<List<SkillDto>> getMostUsedSkills(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(skillService.getMostUsedSkills(limit));
    }
}

