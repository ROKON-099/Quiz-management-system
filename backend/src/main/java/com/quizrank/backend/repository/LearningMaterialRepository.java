package com.quizrank.backend.repository;
import com.quizrank.backend.entity.LearningMaterial; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface LearningMaterialRepository extends JpaRepository<LearningMaterial,Integer> { List<LearningMaterial> findAllByOrderByCreatedAtDesc(); List<LearningMaterial> findByTeacherIdOrderByCreatedAtDesc(Integer teacherId); }
