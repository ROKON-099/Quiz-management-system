package com.quizrank.backend.repository;
import com.quizrank.backend.entity.AcademicRecord; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface AcademicRecordRepository extends JpaRepository<AcademicRecord,Integer> { List<AcademicRecord> findByStudentIdOrderByIdDesc(Integer studentId); Optional<AcademicRecord> findFirstByStudentIdAndSemester(Integer studentId,String semester); }
