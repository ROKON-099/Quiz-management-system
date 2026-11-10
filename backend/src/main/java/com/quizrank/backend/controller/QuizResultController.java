package com.quizrank.backend.controller;

import com.quizrank.backend.dto.CourseResultDTO;
import com.quizrank.backend.dto.QuizResultResponseDTO;
import com.quizrank.backend.entity.Quiz;
import com.quizrank.backend.entity.QuizResult;
import com.quizrank.backend.entity.User;

import com.quizrank.backend.repository.QuizRepository;
import com.quizrank.backend.repository.QuizResultRepository;
import com.quizrank.backend.repository.UserRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz-results")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizResultController {

    private final QuizResultRepository resultRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;

    public QuizResultController(
            QuizResultRepository resultRepository,
            QuizRepository quizRepository,
            UserRepository userRepository
    ) {
        this.resultRepository = resultRepository;
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
    }

    // Student's own results
    @GetMapping("/student/{id}")
    public List<CourseResultDTO> student(@PathVariable Integer id) {

        List<QuizResult> results =
                resultRepository.findByStudentIdOrderBySubmittedAtDesc(id);

        String studentName = userRepository.findById(id)
                .map(User::getName)
                .orElse("Unknown Student");

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
                            result.getTotal(),
                            studentName
                    );
                })
                .filter(result -> result != null)
                .toList();
    }

    // Results of a particular quiz with student names
    @GetMapping("/quiz/{id}")
    public List<QuizResultResponseDTO> quiz(@PathVariable Integer id) {

        List<QuizResult> results =
                resultRepository.findByQuizIdOrderByScoreDesc(id);

        return results.stream()
                .map(result -> {

                    String studentName = userRepository
                            .findById(result.getStudentId())
                            .map(User::getName)
                            .orElse("Unknown Student");

                    return new QuizResultResponseDTO(
                            result.getId(),
                            result.getStudentId(),
                            studentName,
                            result.getQuizId(),
                            result.getScore(),
                            result.getTotal(),
                            result.getSubmittedAt()
                    );
                })
                .toList();
    }
}