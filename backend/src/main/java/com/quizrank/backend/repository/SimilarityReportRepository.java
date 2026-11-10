package com.quizrank.backend.repository;
import com.quizrank.backend.entity.SimilarityReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface SimilarityReportRepository extends JpaRepository<SimilarityReport,Long> {
 Optional<SimilarityReport> findBySubmissionAIdAndSubmissionBId(Integer a,Integer b);
 List<SimilarityReport> findByAssignmentIdOrderBySimilarityPercentDesc(Integer assignmentId);
 List<SimilarityReport> findByStudentAIdOrStudentBIdOrderByCreatedAtDesc(Integer a,Integer b);
}
