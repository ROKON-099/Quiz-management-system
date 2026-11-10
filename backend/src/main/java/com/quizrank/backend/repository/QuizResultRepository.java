package com.quizrank.backend.repository;

import com.quizrank.backend.entity.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizResultRepository
        extends JpaRepository<QuizResult, Integer> {

    // Get all results of a student
    List<QuizResult> findByStudentIdOrderBySubmittedAtDesc(
            Integer studentId
    );

    // Get all results of a quiz
    List<QuizResult> findByQuizIdOrderByScoreDesc(
            Integer quizId
    );

    // Get previous result of a student for a specific quiz
    Optional<QuizResult> findFirstByStudentIdAndQuizId(
            Integer studentId,
            Integer quizId
    );
}