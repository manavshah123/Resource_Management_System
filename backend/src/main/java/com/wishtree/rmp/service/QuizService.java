package com.wishtree.rmp.service;

import com.wishtree.rmp.dto.*;
import com.wishtree.rmp.entity.*;
import com.wishtree.rmp.exceptions.BadRequestException;
import com.wishtree.rmp.exceptions.ResourceNotFoundException;
import com.wishtree.rmp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizAssignmentRepository assignmentRepository;
    private final QuizAttemptRepository attemptRepository;
    private final TrainingRepository trainingRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmployeeSkillRepository employeeSkillRepository;

    // ========== Quiz CRUD ==========

    @Transactional(readOnly = true)
    public Page<QuizDto> getAllQuizzes(Pageable pageable) {
        return quizRepository.findAll(pageable).map(QuizDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<QuizDto> getPublishedQuizzes(Pageable pageable) {
        return quizRepository.findByStatus(Quiz.Status.PUBLISHED, pageable).map(QuizDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public QuizDto getQuizById(Long id) {
        Quiz quiz = quizRepository.findByIdWithQuestions(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        return QuizDto.fromEntity(quiz, true);
    }

    @Transactional(readOnly = true)
    public QuizDto getQuizForAttempt(Long id) {
        Quiz quiz = quizRepository.findByIdWithQuestions(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        
        // For attempt, hide correct answers
        QuizDto dto = QuizDto.fromEntity(quiz, true);
        if (dto.getQuestions() != null) {
            dto.getQuestions().forEach(q -> {
                if (q.getOptions() != null) {
                    q.getOptions().forEach(o -> {
                        o.setIsCorrect(null); // Hide correct answers
                        o.setExplanation(null);
                    });
                }
                q.setExplanation(null);
            });
        }
        return dto;
    }

    @Transactional
    public QuizDto createQuiz(QuizCreateDto dto) {
        Quiz quiz = Quiz.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .difficulty(Quiz.Difficulty.valueOf(dto.getDifficulty()))
                .category(Quiz.Category.valueOf(dto.getCategory()))
                .passingScore(dto.getPassingScore())
                .durationMinutes(dto.getDurationMinutes())
                .maxAttempts(dto.getMaxAttempts())
                .shuffleQuestions(dto.getShuffleQuestions() != null ? dto.getShuffleQuestions() : false)
                .showCorrectAnswers(dto.getShowCorrectAnswers() != null ? dto.getShowCorrectAnswers() : true)
                .status(Quiz.Status.DRAFT)
                .build();

        if (dto.getTrainingId() != null) {
            Training training = trainingRepository.findById(dto.getTrainingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Training not found"));
            quiz.setTraining(training);
        }

        // Set author from current user
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByEmail(email).ifPresent(quiz::setAuthor);

        Quiz savedQuiz = quizRepository.save(quiz);

        // Add questions if provided
        if (dto.getQuestions() != null && !dto.getQuestions().isEmpty()) {
            addQuestionsToQuiz(savedQuiz, dto.getQuestions());
        }

        log.info("Created quiz: {} with {} questions", savedQuiz.getTitle(), 
                dto.getQuestions() != null ? dto.getQuestions().size() : 0);
        return QuizDto.fromEntity(savedQuiz, true);
    }

    @Transactional
    public QuizDto updateQuiz(Long id, QuizCreateDto dto) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));

        quiz.setTitle(dto.getTitle());
        quiz.setDescription(dto.getDescription());
        quiz.setDifficulty(Quiz.Difficulty.valueOf(dto.getDifficulty()));
        quiz.setCategory(Quiz.Category.valueOf(dto.getCategory()));
        quiz.setPassingScore(dto.getPassingScore());
        quiz.setDurationMinutes(dto.getDurationMinutes());
        quiz.setMaxAttempts(dto.getMaxAttempts());
        quiz.setShuffleQuestions(dto.getShuffleQuestions());
        quiz.setShowCorrectAnswers(dto.getShowCorrectAnswers());

        if (dto.getTrainingId() != null) {
            Training training = trainingRepository.findById(dto.getTrainingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Training not found"));
            quiz.setTraining(training);
        } else {
            quiz.setTraining(null);
        }

        Quiz savedQuiz = quizRepository.save(quiz);
        log.info("Updated quiz: {}", savedQuiz.getTitle());
        return QuizDto.fromEntity(savedQuiz, true);
    }

    @Transactional
    public QuizDto publishQuiz(Long id) {
        Quiz quiz = quizRepository.findByIdWithQuestions(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));

        if (quiz.getQuestions() == null || quiz.getQuestions().isEmpty()) {
            throw new BadRequestException("Cannot publish quiz without questions");
        }

        quiz.setStatus(Quiz.Status.PUBLISHED);
        Quiz savedQuiz = quizRepository.save(quiz);
        log.info("Published quiz: {}", savedQuiz.getTitle());
        return QuizDto.fromEntity(savedQuiz, true);
    }

    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        
        // Check if quiz has any completed assignments
        long completedCount = assignmentRepository.countByQuizIdAndStatus(id, QuizAssignment.Status.COMPLETED);
        if (completedCount > 0) {
            quiz.setStatus(Quiz.Status.ARCHIVED);
            quizRepository.save(quiz);
            log.info("Archived quiz: {} (has {} completed assignments)", quiz.getTitle(), completedCount);
        } else {
            quizRepository.delete(quiz);
            log.info("Deleted quiz: {}", quiz.getTitle());
        }
    }

    // ========== Question Management ==========

    @Transactional
    public QuizDto addQuestion(Long quizId, QuizCreateDto.QuestionCreateDto questionDto) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));

        Integer maxOrder = questionRepository.findMaxOrderIndex(quizId);
        int orderIndex = (maxOrder != null ? maxOrder : 0) + 1;

        QuizQuestion question = createQuestionFromDto(questionDto, quiz, orderIndex);
        questionRepository.save(question);

        return getQuizById(quizId);
    }

    @Transactional
    public QuizDto updateQuestion(Long quizId, Long questionId, QuizCreateDto.QuestionCreateDto questionDto) {
        QuizQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        if (!question.getQuiz().getId().equals(quizId)) {
            throw new BadRequestException("Question does not belong to this quiz");
        }

        question.setQuestionText(questionDto.getQuestionText());
        question.setType(QuizQuestion.QuestionType.valueOf(questionDto.getType()));
        question.setPoints(questionDto.getPoints());
        question.setExplanation(questionDto.getExplanation());
        question.setImageUrl(questionDto.getImageUrl());

        // Update options
        question.getOptions().clear();
        if (questionDto.getOptions() != null) {
            int optionOrder = 0;
            for (QuizCreateDto.OptionCreateDto optDto : questionDto.getOptions()) {
                QuizOption option = QuizOption.builder()
                        .question(question)
                        .optionText(optDto.getOptionText())
                        .isCorrect(optDto.getIsCorrect())
                        .orderIndex(optionOrder++)
                        .explanation(optDto.getExplanation())
                        .build();
                question.getOptions().add(option);
            }
        }

        questionRepository.save(question);
        return getQuizById(quizId);
    }

    @Transactional
    public void deleteQuestion(Long quizId, Long questionId) {
        QuizQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        if (!question.getQuiz().getId().equals(quizId)) {
            throw new BadRequestException("Question does not belong to this quiz");
        }

        questionRepository.delete(question);
        log.info("Deleted question {} from quiz {}", questionId, quizId);
    }

    private void addQuestionsToQuiz(Quiz quiz, List<QuizCreateDto.QuestionCreateDto> questionDtos) {
        int orderIndex = 0;
        for (QuizCreateDto.QuestionCreateDto qDto : questionDtos) {
            QuizQuestion question = createQuestionFromDto(qDto, quiz, orderIndex++);
            questionRepository.save(question);
        }
    }

    private QuizQuestion createQuestionFromDto(QuizCreateDto.QuestionCreateDto dto, Quiz quiz, int orderIndex) {
        QuizQuestion question = QuizQuestion.builder()
                .quiz(quiz)
                .questionText(dto.getQuestionText())
                .type(QuizQuestion.QuestionType.valueOf(dto.getType()))
                .points(dto.getPoints())
                .orderIndex(dto.getOrderIndex() != null ? dto.getOrderIndex() : orderIndex)
                .explanation(dto.getExplanation())
                .imageUrl(dto.getImageUrl())
                .build();

        if (dto.getOptions() != null) {
            List<QuizOption> options = new ArrayList<>();
            int optionOrder = 0;
            for (QuizCreateDto.OptionCreateDto optDto : dto.getOptions()) {
                QuizOption option = QuizOption.builder()
                        .question(question)
                        .optionText(optDto.getOptionText())
                        .isCorrect(optDto.getIsCorrect())
                        .orderIndex(optionOrder++)
                        .explanation(optDto.getExplanation())
                        .build();
                options.add(option);
            }
            question.setOptions(options);
        }

        return question;
    }

    // ========== Quiz Assignment ==========

    @Transactional
    public QuizAssignmentDto assignQuiz(Long quizId, Long employeeId, LocalDate dueDate, String remarks) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));

        if (quiz.getStatus() != Quiz.Status.PUBLISHED) {
            throw new BadRequestException("Can only assign published quizzes");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        // Check if already assigned
        Optional<QuizAssignment> existing = assignmentRepository.findByQuizIdAndEmployeeId(quizId, employeeId);
        if (existing.isPresent() && existing.get().getStatus() != QuizAssignment.Status.EXPIRED) {
            throw new BadRequestException("Quiz already assigned to this employee");
        }

        QuizAssignment assignment = QuizAssignment.builder()
                .quiz(quiz)
                .employee(employee)
                .dueDate(dueDate)
                .remarks(remarks)
                .status(QuizAssignment.Status.PENDING)
                .attemptsUsed(0)
                .build();

        // Set assigned by from current user
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByEmail(email).ifPresent(assignment::setAssignedBy);

        QuizAssignment saved = assignmentRepository.save(assignment);
        log.info("Assigned quiz {} to employee {}", quiz.getTitle(), employee.getName());
        return QuizAssignmentDto.fromEntity(saved);
    }

    @Transactional
    public List<QuizAssignmentDto> assignQuizToMultiple(Long quizId, List<Long> employeeIds, LocalDate dueDate, String remarks) {
        List<QuizAssignmentDto> assignments = new ArrayList<>();
        for (Long employeeId : employeeIds) {
            try {
                assignments.add(assignQuiz(quizId, employeeId, dueDate, remarks));
            } catch (BadRequestException e) {
                log.warn("Skipping assignment for employee {}: {}", employeeId, e.getMessage());
            }
        }
        return assignments;
    }

    @Transactional(readOnly = true)
    public List<QuizAssignmentDto> getMyQuizAssignments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getEmployee() == null) {
            return Collections.emptyList();
        }

        return assignmentRepository.findByEmployeeId(user.getEmployee().getId()).stream()
                .map(QuizAssignmentDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<QuizAssignmentDto> getQuizAssignments(Long quizId) {
        return assignmentRepository.findByQuizId(quizId).stream()
                .map(QuizAssignmentDto::fromEntity)
                .toList();
    }

    // ========== Quiz Taking ==========

    @Transactional
    public Map<String, Object> startQuizAttempt(Long assignmentId) {
        QuizAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        // Check if can attempt
        if (assignment.getStatus() == QuizAssignment.Status.COMPLETED) {
            throw new BadRequestException("Quiz already completed");
        }

        if (assignment.getQuiz().getMaxAttempts() != null && 
            assignment.getAttemptsUsed() >= assignment.getQuiz().getMaxAttempts()) {
            throw new BadRequestException("Maximum attempts reached");
        }

        // Check for existing in-progress attempt
        Optional<QuizAttempt> existingAttempt = attemptRepository.findActiveAttempt(assignmentId);
        if (existingAttempt.isPresent()) {
            return Map.of(
                    "attemptId", existingAttempt.get().getId(),
                    "quiz", getQuizForAttempt(assignment.getQuiz().getId()),
                    "startedAt", existingAttempt.get().getStartedAt(),
                    "resumed", true
            );
        }

        // Create new attempt
        QuizAttempt attempt = QuizAttempt.builder()
                .assignment(assignment)
                .attemptNumber(assignment.getAttemptsUsed() + 1)
                .startedAt(LocalDateTime.now())
                .status(QuizAttempt.Status.IN_PROGRESS)
                .totalPoints(assignment.getQuiz().getTotalPoints())
                .build();

        QuizAttempt savedAttempt = attemptRepository.save(attempt);

        // Update assignment
        assignment.setAttemptsUsed(assignment.getAttemptsUsed() + 1);
        assignment.setStatus(QuizAssignment.Status.IN_PROGRESS);
        assignmentRepository.save(assignment);

        log.info("Started quiz attempt {} for assignment {}", savedAttempt.getAttemptNumber(), assignmentId);

        return Map.of(
                "attemptId", savedAttempt.getId(),
                "quiz", getQuizForAttempt(assignment.getQuiz().getId()),
                "startedAt", savedAttempt.getStartedAt(),
                "resumed", false
        );
    }

    @Transactional
    public Map<String, Object> submitQuizAttempt(Long attemptId, List<Map<String, Object>> answers) {
        QuizAttempt attempt = attemptRepository.findByIdWithAnswers(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        if (attempt.getStatus() != QuizAttempt.Status.IN_PROGRESS) {
            throw new BadRequestException("Attempt is not in progress");
        }

        // Process answers
        attempt.getAnswers().clear();
        int totalScore = 0;

        for (Map<String, Object> answerData : answers) {
            Long questionId = ((Number) answerData.get("questionId")).longValue();
            @SuppressWarnings("unchecked")
            List<Long> selectedOptionIds = ((List<Number>) answerData.get("selectedOptions"))
                    .stream().map(Number::longValue).toList();

            QuizQuestion question = questionRepository.findByIdWithOptions(questionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + questionId));

            QuizAnswer answer = QuizAnswer.builder()
                    .attempt(attempt)
                    .question(question)
                    .build();

            // Find selected options
            List<QuizOption> selectedOptions = question.getOptions().stream()
                    .filter(o -> selectedOptionIds.contains(o.getId()))
                    .toList();
            answer.setSelectedOptions(new ArrayList<>(selectedOptions));

            // Evaluate answer
            answer.evaluateAnswer();
            totalScore += answer.getPointsEarned();

            attempt.getAnswers().add(answer);
        }

        // Calculate final score
        attempt.setScore(totalScore);
        attempt.setScorePercentage(attempt.getTotalPoints() > 0 ? 
                (totalScore * 100) / attempt.getTotalPoints() : 0);
        attempt.setPassed(attempt.getScorePercentage() >= attempt.getAssignment().getQuiz().getPassingScore());
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setStatus(QuizAttempt.Status.SUBMITTED);
        attempt.setTimeSpentSeconds((int) java.time.Duration.between(
                attempt.getStartedAt(), attempt.getSubmittedAt()).getSeconds());

        attemptRepository.save(attempt);

        // Update assignment
        QuizAssignment assignment = attempt.getAssignment();
        if (assignment.getBestScore() == null || attempt.getScorePercentage() > assignment.getBestScore()) {
            assignment.setBestScore(attempt.getScorePercentage());
        }
        if (attempt.getPassed()) {
            assignment.setStatus(QuizAssignment.Status.COMPLETED);
            assignment.setCompletedAt(LocalDateTime.now());
            assignment.setPassed(true);
        } else if (assignment.getQuiz().getMaxAttempts() != null && 
                   assignment.getAttemptsUsed() >= assignment.getQuiz().getMaxAttempts()) {
            assignment.setStatus(QuizAssignment.Status.FAILED);
            assignment.setPassed(false);
        }
        assignmentRepository.save(assignment);

        log.info("Submitted quiz attempt {} with score {}%", attemptId, attempt.getScorePercentage());

        Map<String, Object> result = new HashMap<>();
        result.put("score", attempt.getScore());
        result.put("totalPoints", attempt.getTotalPoints());
        result.put("scorePercentage", attempt.getScorePercentage());
        result.put("passed", attempt.getPassed());
        result.put("passingScore", assignment.getQuiz().getPassingScore());
        result.put("timeSpentSeconds", attempt.getTimeSpentSeconds());
        result.put("showCorrectAnswers", assignment.getQuiz().getShowCorrectAnswers());

        if (Boolean.TRUE.equals(assignment.getQuiz().getShowCorrectAnswers())) {
            result.put("quiz", getQuizById(assignment.getQuiz().getId()));
        }

        return result;
    }

    // ========== Statistics ==========

    @Transactional(readOnly = true)
    public Map<String, Object> getQuizStatistics(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAssignments", assignmentRepository.findByQuizId(quizId).size());
        stats.put("completedCount", assignmentRepository.countByQuizIdAndStatus(quizId, QuizAssignment.Status.COMPLETED));
        stats.put("passedCount", assignmentRepository.countByQuizIdAndPassed(quizId, true));
        stats.put("failedCount", assignmentRepository.countByQuizIdAndPassed(quizId, false));
        stats.put("averageScore", assignmentRepository.findAverageScoreByQuizId(quizId));
        stats.put("totalQuestions", quiz.getTotalQuestions());
        stats.put("totalPoints", quiz.getTotalPoints());

        return stats;
    }
}

