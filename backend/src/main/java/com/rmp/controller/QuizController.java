package com.rmp.controller;

import com.rmp.dto.QuizAssignmentDto;
import com.rmp.dto.QuizCreateDto;
import com.rmp.dto.QuizDto;
import com.rmp.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/quizzes")
@RequiredArgsConstructor
@Tag(name = "Quizzes", description = "Quiz management APIs")
public class QuizController {

    private final QuizService quizService;

    // ========== Quiz CRUD ==========

    @GetMapping
    @Operation(summary = "Get all quizzes", description = "Get paginated list of quizzes")
    public ResponseEntity<Page<QuizDto>> getAllQuizzes(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(quizService.getAllQuizzes(pageable));
    }

    @GetMapping("/published")
    @Operation(summary = "Get published quizzes", description = "Get paginated list of published quizzes")
    public ResponseEntity<Page<QuizDto>> getPublishedQuizzes(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(quizService.getPublishedQuizzes(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get quiz by ID", description = "Get single quiz with all questions")
    public ResponseEntity<QuizDto> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PM')")
    @Operation(summary = "Create quiz", description = "Create a new quiz")
    public ResponseEntity<QuizDto> createQuiz(@Valid @RequestBody QuizCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.createQuiz(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PM')")
    @Operation(summary = "Update quiz", description = "Update an existing quiz")
    public ResponseEntity<QuizDto> updateQuiz(@PathVariable Long id, @Valid @RequestBody QuizCreateDto dto) {
        return ResponseEntity.ok(quizService.updateQuiz(id, dto));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PM')")
    @Operation(summary = "Publish quiz", description = "Publish a quiz to make it available for assignment")
    public ResponseEntity<QuizDto> publishQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.publishQuiz(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Delete quiz", description = "Delete or archive a quiz")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Question Management ==========

    @PostMapping("/{quizId}/questions")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PM')")
    @Operation(summary = "Add question", description = "Add a question to a quiz")
    public ResponseEntity<QuizDto> addQuestion(
            @PathVariable Long quizId,
            @Valid @RequestBody QuizCreateDto.QuestionCreateDto questionDto) {
        return ResponseEntity.ok(quizService.addQuestion(quizId, questionDto));
    }

    @PutMapping("/{quizId}/questions/{questionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PM')")
    @Operation(summary = "Update question", description = "Update a question in a quiz")
    public ResponseEntity<QuizDto> updateQuestion(
            @PathVariable Long quizId,
            @PathVariable Long questionId,
            @Valid @RequestBody QuizCreateDto.QuestionCreateDto questionDto) {
        return ResponseEntity.ok(quizService.updateQuestion(quizId, questionId, questionDto));
    }

    @DeleteMapping("/{quizId}/questions/{questionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PM')")
    @Operation(summary = "Delete question", description = "Delete a question from a quiz")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long quizId,
            @PathVariable Long questionId) {
        quizService.deleteQuestion(quizId, questionId);
        return ResponseEntity.noContent().build();
    }

    // ========== Quiz Assignment ==========

    @PostMapping("/{quizId}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PM')")
    @Operation(summary = "Assign quiz", description = "Assign a quiz to an employee")
    public ResponseEntity<QuizAssignmentDto> assignQuiz(
            @PathVariable Long quizId,
            @RequestBody Map<String, Object> request) {
        Long employeeId = ((Number) request.get("employeeId")).longValue();
        LocalDate dueDate = LocalDate.parse((String) request.get("dueDate"));
        String remarks = (String) request.get("remarks");
        return ResponseEntity.ok(quizService.assignQuiz(quizId, employeeId, dueDate, remarks));
    }

    @PostMapping("/{quizId}/assign-multiple")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PM')")
    @Operation(summary = "Assign quiz to multiple employees", description = "Assign a quiz to multiple employees")
    public ResponseEntity<List<QuizAssignmentDto>> assignQuizToMultiple(
            @PathVariable Long quizId,
            @RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Long> employeeIds = ((List<Number>) request.get("employeeIds"))
                .stream().map(Number::longValue).toList();
        LocalDate dueDate = LocalDate.parse((String) request.get("dueDate"));
        String remarks = (String) request.get("remarks");
        return ResponseEntity.ok(quizService.assignQuizToMultiple(quizId, employeeIds, dueDate, remarks));
    }

    @GetMapping("/my-assignments")
    @Operation(summary = "Get my quiz assignments", description = "Get quiz assignments for current user")
    public ResponseEntity<List<QuizAssignmentDto>> getMyQuizAssignments() {
        return ResponseEntity.ok(quizService.getMyQuizAssignments());
    }

    @GetMapping("/{quizId}/assignments")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PM')")
    @Operation(summary = "Get quiz assignments", description = "Get all assignments for a quiz")
    public ResponseEntity<List<QuizAssignmentDto>> getQuizAssignments(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuizAssignments(quizId));
    }

    // ========== Quiz Taking ==========

    @PostMapping("/assignments/{assignmentId}/start")
    @Operation(summary = "Start quiz attempt", description = "Start or resume a quiz attempt")
    public ResponseEntity<Map<String, Object>> startQuizAttempt(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(quizService.startQuizAttempt(assignmentId));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    @Operation(summary = "Submit quiz attempt", description = "Submit answers for a quiz attempt")
    public ResponseEntity<Map<String, Object>> submitQuizAttempt(
            @PathVariable Long attemptId,
            @RequestBody List<Map<String, Object>> answers) {
        return ResponseEntity.ok(quizService.submitQuizAttempt(attemptId, answers));
    }

    // ========== Statistics ==========

    @GetMapping("/{quizId}/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PM')")
    @Operation(summary = "Get quiz statistics", description = "Get statistics for a quiz")
    public ResponseEntity<Map<String, Object>> getQuizStatistics(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuizStatistics(quizId));
    }
}

