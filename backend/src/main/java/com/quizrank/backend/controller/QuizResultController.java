package com.quizrank.backend.controller;

import com.quizrank.backend.dto.CourseResultDTO;
import com.quizrank.backend.entity.Quiz;
import com.quizrank.backend.entity.QuizResult;
import com.quizrank.backend.repository.QuizRepository;
import com.quizrank.backend.repository.QuizResultRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz-results")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizResultController {

    private final QuizResultRepository resultRepository;
    private final QuizRepository quizRepository;

    public QuizResultController(
            QuizResultRepository resultRepository,
            QuizRepository quizRepository
    ) {
        this.resultRepository = resultRepository;
        this.quizRepository = quizRepository;
    }

    @GetMapping("/student/{id}")
    public List<CourseResultDTO> student(@PathVariable Integer id) {

        List<QuizResult> results =
                resultRepository.findByStudentIdOrderBySubmittedAtDesc(id);

        return results.stream()
                .map(result -> {

                    Quiz quiz = quizRepository.findById(result.getQuizId())
                            .orElse(null);

                    if (quiz == null) {
                        return null;
                    }

                    return new CourseResultDTO(
                            quiz.getSubjectId(),
                            result.getQuizId(),
                            result.getScore(),
                            result.getTotal()
                    );
                })
                .filter(result -> result != null)
                .toList();
    }

    @GetMapping("/quiz/{id}")
    public List<QuizResult> quiz(@PathVariable Integer id) {
        return resultRepository.findByQuizIdOrderByScoreDesc(id);
    }
}