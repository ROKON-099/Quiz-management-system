package com.quizrank.backend.repository;
import com.quizrank.backend.entity.Quiz; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface QuizRepository extends JpaRepository<Quiz,Integer> { List<Quiz> findBySubjectId(Integer subjectId); List<Quiz> findByCreatedBy(Integer teacherId); }
