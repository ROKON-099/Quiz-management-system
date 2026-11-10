package com.quizrank.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="similarity_reports",
 uniqueConstraints=@UniqueConstraint(name="uk_similarity_pair", columnNames={"submission_a_id","submission_b_id"}),
 indexes={@Index(name="idx_similarity_assignment",columnList="assignment_id"),@Index(name="idx_similarity_score",columnList="similarity_percent")})
public class SimilarityReport {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="assignment_id",nullable=false) private Integer assignmentId;
 @Column(name="submission_a_id",nullable=false) private Integer submissionAId;
 @Column(name="submission_b_id",nullable=false) private Integer submissionBId;
 @Column(name="student_a_id",nullable=false) private Integer studentAId;
 @Column(name="student_b_id",nullable=false) private Integer studentBId;
 @Column(name="similarity_percent",nullable=false) private double similarityPercent;
 @Column(name="cosine_percent",nullable=false) private double cosinePercent;
 @Column(name="jaccard_percent",nullable=false) private double jaccardPercent;
 @Column(name="ngram_percent",nullable=false) private double ngramPercent;
 @Column(nullable=false,length=30) private String status;
 @Column(name="matched_count",nullable=false) private int matchedCount;
 @Lob @Column(name="matched_text",columnDefinition="LONGTEXT") private String matchedText;
 @Column(name="created_at",insertable=false,updatable=false) private LocalDateTime createdAt;
 public Long getId(){return id;} public Integer getAssignmentId(){return assignmentId;} public void setAssignmentId(Integer v){assignmentId=v;}
 public Integer getSubmissionAId(){return submissionAId;} public void setSubmissionAId(Integer v){submissionAId=v;}
 public Integer getSubmissionBId(){return submissionBId;} public void setSubmissionBId(Integer v){submissionBId=v;}
 public Integer getStudentAId(){return studentAId;} public void setStudentAId(Integer v){studentAId=v;}
 public Integer getStudentBId(){return studentBId;} public void setStudentBId(Integer v){studentBId=v;}
 public double getSimilarityPercent(){return similarityPercent;} public void setSimilarityPercent(double v){similarityPercent=v;}
 public double getCosinePercent(){return cosinePercent;} public void setCosinePercent(double v){cosinePercent=v;}
 public double getJaccardPercent(){return jaccardPercent;} public void setJaccardPercent(double v){jaccardPercent=v;}
 public double getNgramPercent(){return ngramPercent;} public void setNgramPercent(double v){ngramPercent=v;}
 public String getStatus(){return status;} public void setStatus(String v){status=v;}
 public int getMatchedCount(){return matchedCount;} public void setMatchedCount(int v){matchedCount=v;}
 public String getMatchedText(){return matchedText;} public void setMatchedText(String v){matchedText=v;}
 public LocalDateTime getCreatedAt(){return createdAt;}
}
