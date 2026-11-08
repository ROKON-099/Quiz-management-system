package com.quizrank.backend.repository;
import com.quizrank.backend.entity.Assignment; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface AssignmentRepository extends JpaRepository<Assignment,Integer> { List<Assignment> findAllByOrderByCreatedAtDesc(); List<Assignment> findByTeacherIdOrderByCreatedAtDesc(Integer teacherId); }
