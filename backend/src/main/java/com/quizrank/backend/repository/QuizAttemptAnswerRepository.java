package com.quizrank.backend.repository;
import com.quizrank.backend.entity.QuizAttemptAnswer; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface QuizAttemptAnswerRepository extends JpaRepository<QuizAttemptAnswer,Integer> { List<QuizAttemptAnswer> findByAttemptId(Integer attemptId); Optional<QuizAttemptAnswer> findByAttemptIdAndQuestionId(Integer attemptId,Integer questionId); }
