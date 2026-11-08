package com.quizrank.backend.repository;
import com.quizrank.backend.entity.QuizAttempt; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt,Integer> { Optional<QuizAttempt> findFirstByStudentIdAndQuizIdAndStatus(Integer studentId,Integer quizId,QuizAttempt.Status status); }
