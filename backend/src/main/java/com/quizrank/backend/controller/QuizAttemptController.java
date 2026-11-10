
package com.quizrank.backend.controller;

import com.quizrank.backend.entity.*;
import com.quizrank.backend.service.QuizService;
import com.quizrank.backend.dto.AnswerRequest;
import com.quizrank.backend.dto.AttemptStatusResponse;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attempts")
public class QuizAttemptController {

    private final QuizService s;

    public QuizAttemptController(QuizService s) {
        this.s = s;
    }

    // ==========================================
    // CHECK PREVIOUS ATTEMPT
    // ==========================================

    @GetMapping("/check")
    public AttemptStatusResponse check(
            @RequestParam Integer studentId,
            @RequestParam Integer quizId
    ) {
        return s.checkAttempt(studentId, quizId);
    }

    // ==========================================
    // START OR RESUME QUIZ
    // ==========================================

    @PostMapping("/start")
    public QuizAttempt start(
            @RequestParam Integer studentId,
            @RequestParam Integer quizId
    ) {
        return s.start(studentId, quizId);
    }

    // ==========================================
    // SUBMIT ANSWER
    // ==========================================

    @PostMapping("/{attemptId}/answer")
    public QuizAttemptAnswer answer(
            @PathVariable Integer attemptId,
            @Valid @RequestBody AnswerRequest req
    ) {
        return s.answer(attemptId, req);
    }

    // ==========================================
    // FINISH QUIZ
    // ==========================================

    @PostMapping("/{attemptId}/finish")
    public QuizResult finish(
            @PathVariable Integer attemptId
    ) {
        return s.finish(attemptId);
    }
}
