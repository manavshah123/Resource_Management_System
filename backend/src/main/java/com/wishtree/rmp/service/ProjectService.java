package com.wishtree.rmp.service;

import com.wishtree.rmp.dto.ProjectCreateDto;
import com.wishtree.rmp.dto.ProjectDto;
import com.wishtree.rmp.entity.Employee;
import com.wishtree.rmp.entity.Project;
import com.wishtree.rmp.entity.Skill;
import com.wishtree.rmp.exceptions.BadRequestException;
import com.wishtree.rmp.exceptions.ResourceNotFoundException;
import com.wishtree.rmp.repository.EmployeeRepository;
import com.wishtree.rmp.repository.ProjectRepository;
import com.wishtree.rmp.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;

    public Page<ProjectDto> getAllProjects(String search, String status, Pageable pageable) {
        Page<Project> projects;

        if (search != null && !search.isEmpty()) {
            projects = projectRepository.findByNameContainingIgnoreCaseOrClientContainingIgnoreCase(
                    search, search, pageable);
        } else {
            // Use the method that fetches skills eagerly
            projects = projectRepository.findAllWithSkills(pageable);
        }

        return projects.map(ProjectDto::fromEntity);
    }

    public ProjectDto getProjectById(Long id) {
        // Use the method that fetches skills eagerly
        Project project = projectRepository.findByIdWithSkills(id);
        if (project == null) {
            throw new ResourceNotFoundException("Project not found with id: " + id);
        }
        return ProjectDto.fromEntity(project);
    }

    @Transactional
    public ProjectDto createProject(ProjectCreateDto dto) {
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        Project project = Project.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .client(dto.getClient())
                .status(dto.getStatus() != null ? Project.Status.valueOf(dto.getStatus()) : Project.Status.NOT_STARTED)
                .priority(dto.getPriority() != null ? Project.Priority.valueOf(dto.getPriority()) : Project.Priority.MEDIUM)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .budget(dto.getBudget())
                .build();

        if (dto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + dto.getManagerId()));
            project.setManager(manager);
        }

        if (dto.getRequiredSkillIds() != null && !dto.getRequiredSkillIds().isEmpty()) {
            List<Skill> skills = skillRepository.findAllById(dto.getRequiredSkillIds());
            project.getRequiredSkills().addAll(skills);
        }

        Project savedProject = projectRepository.save(project);
        log.info("Created project: {}", savedProject.getName());
        return ProjectDto.fromEntity(savedProject);
    }

    @Transactional
    public ProjectDto updateProject(Long id, ProjectCreateDto dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setClient(dto.getClient());
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());
        project.setBudget(dto.getBudget());

        if (dto.getStatus() != null) {
            project.setStatus(Project.Status.valueOf(dto.getStatus()));
        }
        if (dto.getPriority() != null) {
            project.setPriority(Project.Priority.valueOf(dto.getPriority()));
        }

        if (dto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            project.setManager(manager);
        }

        // Update required skills (techstack)
        if (dto.getRequiredSkillIds() != null) {
            project.getRequiredSkills().clear();
            if (!dto.getRequiredSkillIds().isEmpty()) {
                List<Skill> skills = skillRepository.findAllById(dto.getRequiredSkillIds());
                project.getRequiredSkills().addAll(skills);
            }
        }

        Project updatedProject = projectRepository.save(project);
        log.info("Updated project: {} with {} skills", updatedProject.getName(), project.getRequiredSkills().size());
        return ProjectDto.fromEntity(updatedProject);
    }

    @Transactional
    public ProjectDto updateProjectStatus(Long id, String status) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        project.setStatus(Project.Status.valueOf(status));
        Project updatedProject = projectRepository.save(project);
        log.info("Updated project status: {} -> {}", project.getName(), status);
        return ProjectDto.fromEntity(updatedProject);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        projectRepository.delete(project);
        log.info("Deleted project: {}", project.getName());
    }

    public List<ProjectDto> getActiveProjects() {
        return projectRepository.findActiveProjects()
                .stream()
                .map(ProjectDto::fromEntity)
                .collect(Collectors.toList());
    }

    public long getProjectCountByStatus(Project.Status status) {
        return projectRepository.countByStatus(status);
    }

    public long getTotalCount() {
        return projectRepository.count();
    }
}

