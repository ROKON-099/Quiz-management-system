package com.quizrank.backend.controller;

import com.quizrank.backend.dto.QuizResultRow;
import com.quizrank.backend.entity.QuizResult;
import com.quizrank.backend.entity.User;
import com.quizrank.backend.repository.QuizResultRepository;
import com.quizrank.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/quiz-results")
public class QuizResultController {
    private final QuizResultRepository results;
    private final UserRepository users;

    public QuizResultController(QuizResultRepository results, UserRepository users) {
        this.results = results;
        this.users = users;
    }

    @GetMapping("/student/{studentId}")
    public List<QuizResultRow> student(@PathVariable Integer studentId) {
        return results.findByStudentIdOrderBySubmittedAtDesc(studentId)
                .stream().map(this::toRow).toList();
    }

    @GetMapping("/quiz/{quizId}")
    public List<QuizResultRow> quiz(@PathVariable Integer quizId) {
        return results.findByQuizIdOrderByScoreDesc(quizId)
                .stream().map(this::toRow).toList();
    }

    @GetMapping("/{resultId}")
    public QuizResultRow one(@PathVariable Integer resultId) {
        QuizResult result = results.findById(resultId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Result not found"));
        return toRow(result);
    }

    private QuizResultRow toRow(QuizResult result) {
        User student = users.findById(result.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        int total = result.getTotal() == null ? 0 : result.getTotal();
        int score = result.getScore() == null ? 0 : result.getScore();
        double percentage = total > 0 ? (score * 100.0) / total : 0.0;
        return new QuizResultRow(result.getId(), result.getStudentId(), student.getUserId(),
                student.getName(), result.getQuizId(), score, total, percentage, result.getSubmittedAt());
    }
}
