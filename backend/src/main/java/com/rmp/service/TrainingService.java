package com.rmp.service;

import com.rmp.dto.TrainingAssignmentDto;
import com.rmp.dto.TrainingDto;
import com.rmp.dto.TrainingModuleDto;
import com.rmp.entity.*;
import com.rmp.exceptions.BadRequestException;
import com.rmp.exceptions.ResourceNotFoundException;
import com.rmp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TrainingService {

    private final TrainingRepository trainingRepository;
    private final TrainingAssignmentRepository assignmentRepository;
    private final TrainingModuleRepository moduleRepository;
    private final TrainingProgressRepository progressRepository;
    private final CertificateRepository certificateRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final QuizRepository quizRepository;

    public Page<TrainingDto> getAllTrainings(String search, String category, Pageable pageable) {
        Page<Training> trainings;
        
        if (search != null && !search.isEmpty()) {
            trainings = trainingRepository.searchTrainings(search, pageable);
        } else if (category != null && !category.isEmpty()) {
            trainings = trainingRepository.findByCategory(Training.Category.valueOf(category), pageable);
        } else {
            trainings = trainingRepository.findAll(pageable);
        }
        
        return trainings.map(t -> {
            int assignedCount = (int) assignmentRepository.countTotalByTraining(t.getId());
            int completedCount = (int) assignmentRepository.countCompletedByTraining(t.getId());
            Double avgProgress = assignmentRepository.getAverageProgressByTraining(t.getId());
            return TrainingDto.fromEntityWithStats(t, assignedCount, completedCount, avgProgress != null ? avgProgress : 0);
        });
    }

    public TrainingDto getTrainingById(Long id) {
        Training training = trainingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training not found with id: " + id));
        int assignedCount = (int) assignmentRepository.countTotalByTraining(id);
        int completedCount = (int) assignmentRepository.countCompletedByTraining(id);
        Double avgProgress = assignmentRepository.getAverageProgressByTraining(id);
        return TrainingDto.fromEntityWithStats(training, assignedCount, completedCount, avgProgress != null ? avgProgress : 0);
    }

    @Transactional
    public TrainingDto createTraining(TrainingDto dto) {
        Training training = Training.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(Training.Category.valueOf(dto.getCategory()))
                .difficulty(Training.Difficulty.valueOf(dto.getDifficulty()))
                .durationHours(dto.getDurationHours())
                .dueDate(dto.getDueDate())
                .attachmentUrl(dto.getAttachmentUrl())
                .videoUrl(dto.getVideoUrl())
                .externalLink(dto.getExternalLink())
                .status(Training.Status.ACTIVE)
                .build();
        
        Training saved = trainingRepository.save(training);
        log.info("Created training: {}", saved.getTitle());
        return TrainingDto.fromEntity(saved);
    }

    @Transactional
    public TrainingDto updateTraining(Long id, TrainingDto dto) {
        Training training = trainingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training not found with id: " + id));
        
        training.setTitle(dto.getTitle());
        training.setDescription(dto.getDescription());
        training.setCategory(Training.Category.valueOf(dto.getCategory()));
        training.setDifficulty(Training.Difficulty.valueOf(dto.getDifficulty()));
        training.setDurationHours(dto.getDurationHours());
        training.setDueDate(dto.getDueDate());
        training.setAttachmentUrl(dto.getAttachmentUrl());
        training.setVideoUrl(dto.getVideoUrl());
        training.setExternalLink(dto.getExternalLink());
        
        Training updated = trainingRepository.save(training);
        log.info("Updated training: {}", updated.getTitle());
        return TrainingDto.fromEntity(updated);
    }

    @Transactional
    public void deleteTraining(Long id) {
        Training training = trainingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training not found with id: " + id));
        training.setStatus(Training.Status.ARCHIVED);
        trainingRepository.save(training);
        log.info("Archived training: {}", training.getTitle());
    }

    @Transactional
    public TrainingDto addSkillToTraining(Long trainingId, Long skillId) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ResourceNotFoundException("Training not found"));
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
        
        training.addSkill(skill);
        Training updated = trainingRepository.save(training);
        return TrainingDto.fromEntity(updated);
    }

    // Assignment operations
    @Transactional
    public TrainingAssignmentDto assignTraining(Long trainingId, Long employeeId, LocalDate dueDate, String remarks) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ResourceNotFoundException("Training not found"));
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        if (assignmentRepository.findByTrainingIdAndEmployeeId(trainingId, employeeId).isPresent()) {
            throw new BadRequestException("Employee is already assigned to this training");
        }
        
        TrainingAssignment assignment = TrainingAssignment.builder()
                .training(training)
                .employee(employee)
                .assignedDate(LocalDate.now())
                .dueDate(dueDate)
                .remarks(remarks)
                .status(TrainingAssignment.Status.NOT_STARTED)
                .build();
        
        TrainingAssignment saved = assignmentRepository.save(assignment);
        log.info("Assigned training {} to employee {}", training.getTitle(), employee.getName());
        return TrainingAssignmentDto.fromEntity(saved);
    }

    @Transactional
    public List<TrainingAssignmentDto> bulkAssignTraining(Long trainingId, List<Long> employeeIds, LocalDate dueDate, String remarks) {
        return employeeIds.stream()
                .map(empId -> {
                    try {
                        return assignTraining(trainingId, empId, dueDate, remarks);
                    } catch (BadRequestException e) {
                        log.warn("Skipping assignment for employee {}: {}", empId, e.getMessage());
                        return null;
                    }
                })
                .filter(a -> a != null)
                .collect(Collectors.toList());
    }

    public List<TrainingAssignmentDto> getAssignmentsByEmployee(Long employeeId) {
        return assignmentRepository.findByEmployeeId(employeeId).stream()
                .map(TrainingAssignmentDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TrainingAssignmentDto> getAssignmentsByTraining(Long trainingId) {
        return assignmentRepository.findByTrainingId(trainingId).stream()
                .map(TrainingAssignmentDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public TrainingAssignmentDto updateProgress(Long assignmentId, int progress, String notes) {
        TrainingAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        assignment.updateProgress(progress);
        assignment.setEmployeeNotes(notes);
        
        TrainingAssignment updated = assignmentRepository.save(assignment);
        log.info("Updated progress for assignment {}: {}%", assignmentId, progress);
        return TrainingAssignmentDto.fromEntity(updated);
    }

    @Transactional
    public TrainingAssignmentDto completeTraining(Long assignmentId, String proofUrl) {
        TrainingAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        assignment.complete();
        assignment.setProofUrl(proofUrl);
        
        // Auto-add skills to employee
        Training training = assignment.getTraining();
        Employee employee = assignment.getEmployee();
        
        for (Skill skill : training.getRelatedSkills()) {
            if (!employeeSkillRepository.existsByEmployeeIdAndSkillId(employee.getId(), skill.getId())) {
                EmployeeSkill employeeSkill = EmployeeSkill.builder()
                        .employee(employee)
                        .skill(skill)
                        .level(EmployeeSkill.Level.BEGINNER)
                        .yearsOfExperience(0)
                        .primary(false)
                        .build();
                employeeSkillRepository.save(employeeSkill);
                log.info("Auto-added skill {} to employee {} after training completion", skill.getName(), employee.getName());
            }
        }
        
        assignment.setSkillAdded(true);
        TrainingAssignment updated = assignmentRepository.save(assignment);
        log.info("Completed training for assignment {}", assignmentId);
        return TrainingAssignmentDto.fromEntity(updated);
    }

    public long getActiveTrainingCount() {
        return trainingRepository.countByStatus(Training.Status.ACTIVE);
    }

    public List<Object[]> getTrainingCategoryStats() {
        return trainingRepository.countByCategory();
    }

    public List<Object[]> getAssignmentStatusStats() {
        return assignmentRepository.countByStatusGrouped();
    }

    // ============ Module Management ============

    public TrainingDto getTrainingWithModules(Long id) {
        Training training = trainingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training not found with id: " + id));
        return TrainingDto.fromEntityWithModules(training);
    }

    @Transactional
    public TrainingModuleDto addModule(Long trainingId, TrainingModuleDto dto) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ResourceNotFoundException("Training not found"));

        Integer maxOrder = moduleRepository.findMaxOrderIndexByTrainingId(trainingId);
        int orderIndex = dto.getOrderIndex() != null ? dto.getOrderIndex() : (maxOrder != null ? maxOrder + 1 : 0);

        TrainingModule.TrainingModuleBuilder moduleBuilder = TrainingModule.builder()
                .training(training)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .materialUrl(dto.getMaterialUrl())
                .materialType(dto.getMaterialType() != null ? 
                        TrainingModule.MaterialType.valueOf(dto.getMaterialType()) : 
                        TrainingModule.MaterialType.LINK)
                .durationMinutes(dto.getDurationMinutes())
                .orderIndex(orderIndex)
                .isMandatory(dto.getIsMandatory() != null ? dto.getIsMandatory() : true);

        // If this is a quiz module, link to the quiz
        if ("QUIZ".equals(dto.getMaterialType()) && dto.getQuizId() != null) {
            Quiz quiz = quizRepository.findById(dto.getQuizId())
                    .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + dto.getQuizId()));
            
            if (quiz.getStatus() != Quiz.Status.PUBLISHED) {
                throw new BadRequestException("Can only add published quizzes to training");
            }
            
            moduleBuilder.quiz(quiz);
            
            // Use quiz title if module title not provided
            if (dto.getTitle() == null || dto.getTitle().isEmpty()) {
                moduleBuilder.title("Quiz: " + quiz.getTitle());
            }
        }

        TrainingModule module = moduleBuilder.build();
        TrainingModule saved = moduleRepository.save(module);

        // Update total modules count
        training.setTotalModules(moduleRepository.countByTrainingId(trainingId));
        trainingRepository.save(training);

        log.info("Added module '{}' to training '{}'", saved.getTitle(), training.getTitle());
        return TrainingModuleDto.fromEntity(saved);
    }

    @Transactional
    public TrainingModuleDto updateModule(Long moduleId, TrainingModuleDto dto) {
        TrainingModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        module.setTitle(dto.getTitle());
        module.setDescription(dto.getDescription());
        module.setMaterialUrl(dto.getMaterialUrl());
        if (dto.getMaterialType() != null) {
            module.setMaterialType(TrainingModule.MaterialType.valueOf(dto.getMaterialType()));
        }
        module.setDurationMinutes(dto.getDurationMinutes());
        if (dto.getOrderIndex() != null) {
            module.setOrderIndex(dto.getOrderIndex());
        }
        if (dto.getIsMandatory() != null) {
            module.setIsMandatory(dto.getIsMandatory());
        }

        TrainingModule saved = moduleRepository.save(module);
        log.info("Updated module '{}'", saved.getTitle());
        return TrainingModuleDto.fromEntity(saved);
    }

    @Transactional
    public void deleteModule(Long moduleId) {
        TrainingModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));
        Long trainingId = module.getTraining().getId();
        
        moduleRepository.delete(module);

        // Update total modules count
        Training training = trainingRepository.findById(trainingId).orElse(null);
        if (training != null) {
            training.setTotalModules(moduleRepository.countByTrainingId(trainingId));
            trainingRepository.save(training);
        }

        log.info("Deleted module '{}'", module.getTitle());
    }

    public List<TrainingModuleDto> getModulesByTraining(Long trainingId) {
        return moduleRepository.findByTrainingIdOrderByOrderIndexAsc(trainingId).stream()
                .map(TrainingModuleDto::fromEntity)
                .collect(Collectors.toList());
    }

    // ============ Progress Tracking ============

    public TrainingAssignmentDto getAssignmentWithProgress(Long assignmentId) {
        TrainingAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        List<TrainingModule> modules = moduleRepository.findByTrainingIdOrderByOrderIndexAsc(assignment.getTraining().getId());
        List<TrainingProgress> progressList = progressRepository.findByAssignmentId(assignmentId);
        
        Map<Long, TrainingProgress> progressMap = progressList.stream()
                .collect(Collectors.toMap(p -> p.getModule().getId(), p -> p));

        List<TrainingModuleDto> moduleDtos = modules.stream().map(m -> {
            TrainingModuleDto dto = TrainingModuleDto.fromEntity(m);
            TrainingProgress progress = progressMap.get(m.getId());
            if (progress != null) {
                dto.setProgressStatus(progress.getStatus().name());
                dto.setStartedAt(progress.getStartedAt() != null ? progress.getStartedAt().toString() : null);
                dto.setCompletedAt(progress.getCompletedAt() != null ? progress.getCompletedAt().toString() : null);
                dto.setTimeSpentMinutes(progress.getTimeSpentMinutes());
                dto.setNotes(progress.getNotes());
            } else {
                dto.setProgressStatus("NOT_STARTED");
            }
            return dto;
        }).collect(Collectors.toList());

        int completedCount = (int) progressList.stream()
                .filter(p -> p.getStatus() == TrainingProgress.Status.COMPLETED)
                .count();

        return TrainingAssignmentDto.fromEntityWithModules(assignment, moduleDtos, completedCount);
    }

    @Transactional
    public TrainingModuleDto startModule(Long assignmentId, Long moduleId) {
        TrainingAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        TrainingModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        // Start the assignment if not started
        if (assignment.getStatus() == TrainingAssignment.Status.NOT_STARTED) {
            assignment.start();
            assignmentRepository.save(assignment);
        }

        TrainingProgress progress = progressRepository.findByAssignmentIdAndModuleId(assignmentId, moduleId)
                .orElse(TrainingProgress.builder()
                        .assignment(assignment)
                        .module(module)
                        .status(TrainingProgress.Status.NOT_STARTED)
                        .build());

        if (progress.getStatus() == TrainingProgress.Status.NOT_STARTED) {
            progress.setStatus(TrainingProgress.Status.IN_PROGRESS);
            progress.setStartedAt(LocalDateTime.now());
        }

        TrainingProgress saved = progressRepository.save(progress);
        
        TrainingModuleDto dto = TrainingModuleDto.fromEntity(module);
        dto.setProgressStatus(saved.getStatus().name());
        dto.setStartedAt(saved.getStartedAt() != null ? saved.getStartedAt().toString() : null);
        
        log.info("Started module '{}' for assignment {}", module.getTitle(), assignmentId);
        return dto;
    }

    @Transactional
    public TrainingModuleDto completeModule(Long assignmentId, Long moduleId, String notes, Integer timeSpentMinutes) {
        TrainingAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        TrainingModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        TrainingProgress progress = progressRepository.findByAssignmentIdAndModuleId(assignmentId, moduleId)
                .orElse(TrainingProgress.builder()
                        .assignment(assignment)
                        .module(module)
                        .build());

        progress.setStatus(TrainingProgress.Status.COMPLETED);
        progress.setCompletedAt(LocalDateTime.now());
        if (notes != null) progress.setNotes(notes);
        if (timeSpentMinutes != null) progress.setTimeSpentMinutes(timeSpentMinutes);

        progressRepository.save(progress);

        // Update assignment progress
        updateAssignmentProgress(assignment);

        TrainingModuleDto dto = TrainingModuleDto.fromEntity(module);
        dto.setProgressStatus(TrainingProgress.Status.COMPLETED.name());
        dto.setCompletedAt(progress.getCompletedAt().toString());
        dto.setNotes(progress.getNotes());
        dto.setTimeSpentMinutes(progress.getTimeSpentMinutes());

        log.info("Completed module '{}' for assignment {}", module.getTitle(), assignmentId);
        return dto;
    }

    private void updateAssignmentProgress(TrainingAssignment assignment) {
        int totalModules = moduleRepository.countByTrainingId(assignment.getTraining().getId());
        int completedModules = progressRepository.countCompletedByAssignmentId(assignment.getId());
        
        int progressPercentage = totalModules > 0 ? (completedModules * 100 / totalModules) : 0;
        assignment.setProgressPercentage(progressPercentage);
        
        // Auto-complete if all modules are done
        if (progressPercentage == 100 && assignment.getStatus() != TrainingAssignment.Status.COMPLETED) {
            assignment.complete();
            
            // Auto-add skills
            Training training = assignment.getTraining();
            Employee employee = assignment.getEmployee();
            for (Skill skill : training.getRelatedSkills()) {
                if (!employeeSkillRepository.existsByEmployeeIdAndSkillId(employee.getId(), skill.getId())) {
                    EmployeeSkill employeeSkill = EmployeeSkill.builder()
                            .employee(employee)
                            .skill(skill)
                            .level(EmployeeSkill.Level.BEGINNER)
                            .yearsOfExperience(0)
                            .primary(false)
                            .build();
                    employeeSkillRepository.save(employeeSkill);
                    log.info("Auto-added skill '{}' to employee '{}'", skill.getName(), employee.getName());
                }
            }
            assignment.setSkillAdded(true);
        }
        
        assignmentRepository.save(assignment);
    }

    // Get my trainings (for current employee)
    public List<TrainingAssignmentDto> getMyTrainings(Long employeeId) {
        return assignmentRepository.findByEmployeeId(employeeId).stream()
                .map(a -> {
                    int totalModules = moduleRepository.countByTrainingId(a.getTraining().getId());
                    int completedModules = progressRepository.countCompletedByAssignmentId(a.getId());
                    TrainingAssignmentDto dto = TrainingAssignmentDto.fromEntity(a);
                    dto.setTotalModules(totalModules);
                    dto.setCompletedModules(completedModules);
                    
                    // Add certificate info if exists
                    certificateRepository.findByAssignmentId(a.getId()).ifPresent(cert -> {
                        dto.setHasCertificate(true);
                        dto.setCertificateNumber(cert.getCertificateNumber());
                        dto.setCertificateIssuedDate(cert.getIssuedDate().toString());
                    });
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Get employee progress for manager
    public List<TrainingAssignmentDto> getEmployeeProgressForManager(Long managerId) {
        List<Employee> directReports = employeeRepository.findByManagerId(managerId);
        List<Long> employeeIds = directReports.stream().map(Employee::getId).toList();
        
        return assignmentRepository.findByEmployeeIdIn(employeeIds).stream()
                .map(a -> {
                    int totalModules = moduleRepository.countByTrainingId(a.getTraining().getId());
                    int completedModules = progressRepository.countCompletedByAssignmentId(a.getId());
                    TrainingAssignmentDto dto = TrainingAssignmentDto.fromEntity(a);
                    dto.setTotalModules(totalModules);
                    dto.setCompletedModules(completedModules);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}

