package com.quizrank.backend.repository;
import com.quizrank.backend.entity.AssignmentSubmission; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission,Integer> { Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(Integer assignmentId,Integer studentId); List<AssignmentSubmission> findByAssignmentId(Integer assignmentId); }
