package com.quizrank.backend.repository;
import com.quizrank.backend.entity.QuizResult; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface QuizResultRepository extends JpaRepository<QuizResult,Integer> { List<QuizResult> findByStudentIdOrderBySubmittedAtDesc(Integer studentId); List<QuizResult> findByQuizIdOrderByScoreDesc(Integer quizId); }
