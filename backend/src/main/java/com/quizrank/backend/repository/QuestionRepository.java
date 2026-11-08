package com.quizrank.backend.repository;
import com.quizrank.backend.entity.Question; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface QuestionRepository extends JpaRepository<Question,Integer> { List<Question> findByQuizIdOrderById(Integer quizId); long countByQuizId(Integer quizId); }
