package com.quizrank.backend.entity;
import jakarta.persistence.*; import com.fasterxml.jackson.annotation.JsonIgnore; import java.time.*; import java.math.BigDecimal;
@Entity @Table(name="quiz_results")
public class QuizResult {
@Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
@Column(name="student_id",nullable=false) private Integer studentId;
@Column(name="quiz_id",nullable=false) private Integer quizId;
@Column(nullable=false) private Integer score;
@Column(nullable=false) private Integer total;
@Column(name="submitted_at",insertable=false,updatable=false) private LocalDateTime submittedAt;
public QuizResult(){} public Integer getId(){return id;} public void setId(Integer id){this.id=id;}


public Integer getStudentId(){return studentId;} public void setStudentId(Integer v){this.studentId=v;}
public Integer getQuizId(){return quizId;} public void setQuizId(Integer v){this.quizId=v;}
public Integer getScore(){return score;} public void setScore(Integer v){this.score=v;}
public Integer getTotal(){return total;} public void setTotal(Integer v){this.total=v;}
public LocalDateTime getSubmittedAt(){return submittedAt;} public void setSubmittedAt(LocalDateTime v){this.submittedAt=v;}
}
