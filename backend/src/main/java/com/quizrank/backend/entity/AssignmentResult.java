package com.quizrank.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="assignment_results", uniqueConstraints=@UniqueConstraint(name="uq_assignment_result_student", columnNames={"assignment_id","student_id"}))
public class AssignmentResult {
    public enum Grade { POOR, AVG, GOOD }
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
    @Column(name="assignment_id", nullable=false) private Integer assignmentId;
    @Column(name="submission_id", nullable=false, unique=true) private Integer submissionId;
    @Column(name="student_id", nullable=false) private Integer studentId;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=10) private Grade grade;
    @Column(columnDefinition="TEXT") private String feedback;
    @Column(name="graded_by", nullable=false) private Integer gradedBy;
    @Column(name="graded_at", insertable=false, updatable=false) private LocalDateTime gradedAt;
    public AssignmentResult() {}
    public Integer getId(){return id;} public Integer getAssignmentId(){return assignmentId;} public void setAssignmentId(Integer v){assignmentId=v;}
    public Integer getSubmissionId(){return submissionId;} public void setSubmissionId(Integer v){submissionId=v;}
    public Integer getStudentId(){return studentId;} public void setStudentId(Integer v){studentId=v;}
    public Grade getGrade(){return grade;} public void setGrade(Grade v){grade=v;}
    public String getFeedback(){return feedback;} public void setFeedback(String v){feedback=v;}
    public Integer getGradedBy(){return gradedBy;} public void setGradedBy(Integer v){gradedBy=v;}
    public LocalDateTime getGradedAt(){return gradedAt;}
}
