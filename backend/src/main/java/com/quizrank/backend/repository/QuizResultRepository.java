package com.quizrank.backend.repository;

import com.quizrank.backend.entity.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface QuizResultRepository extends JpaRepository<QuizResult, Integer> {
    List<QuizResult> findByStudentIdOrderBySubmittedAtDesc(Integer studentId);
    List<QuizResult> findByQuizIdOrderByScoreDesc(Integer quizId);
    Optional<QuizResult> findByStudentIdAndQuizId(Integer studentId, Integer quizId);
}
