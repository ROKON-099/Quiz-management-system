package com.quizrank.backend.repository;
import com.quizrank.backend.entity.Subject; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface SubjectRepository extends JpaRepository<Subject,Integer> { List<Subject> findByBatch(String batch); List<Subject> findByTeacherId(Integer teacherId); }
