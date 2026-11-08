package com.quizrank.backend.repository;
import com.quizrank.backend.entity.AssignmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AssignmentResultRepository extends JpaRepository<AssignmentResult,Integer> {
    Optional<AssignmentResult> findBySubmissionId(Integer submissionId);
    List<AssignmentResult> findByAssignmentIdOrderByGradedAtDesc(Integer assignmentId);
    List<AssignmentResult> findByStudentIdOrderByGradedAtDesc(Integer studentId);
}
