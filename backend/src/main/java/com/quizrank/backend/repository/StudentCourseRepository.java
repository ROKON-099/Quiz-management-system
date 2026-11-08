package com.quizrank.backend.repository;
import com.quizrank.backend.entity.StudentCourse; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface StudentCourseRepository extends JpaRepository<StudentCourse,Integer> { List<StudentCourse> findByStudentId(Integer studentId); }
