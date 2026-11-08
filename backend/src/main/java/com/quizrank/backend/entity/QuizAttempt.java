package com.quizrank.backend.entity;
import jakarta.persistence.*; import com.fasterxml.jackson.annotation.JsonIgnore; import java.time.*; import java.math.BigDecimal;
@Entity @Table(name="quiz_attempts")
public class QuizAttempt {
@Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
@Column(name="student_id",nullable=false) private Integer studentId;
@Column(name="quiz_id",nullable=false) private Integer quizId;
@Column(name="current_question") private Integer currentQuestion=0;
private Integer score=0;
@Column(name="question_started_at",nullable=false) private LocalDateTime questionStartedAt;
@Column(name="started_at",insertable=false,updatable=false) private LocalDateTime startedAt;
@Column(name="completed_at") private LocalDateTime completedAt;
@Enumerated(EnumType.STRING) private Status status=Status.IN_PROGRESS;
public enum Status { IN_PROGRESS, COMPLETED }
public QuizAttempt(){} public Integer getId(){return id;} public void setId(Integer id){this.id=id;}


public Integer getStudentId(){return studentId;} public void setStudentId(Integer v){this.studentId=v;}
public Integer getQuizId(){return quizId;} public void setQuizId(Integer v){this.quizId=v;}
public Integer getCurrentQuestion(){return currentQuestion;} public void setCurrentQuestion(Integer v){this.currentQuestion=v;}
public Integer getScore(){return score;} public void setScore(Integer v){this.score=v;}
public LocalDateTime getQuestionStartedAt(){return questionStartedAt;} public void setQuestionStartedAt(LocalDateTime v){this.questionStartedAt=v;}
public LocalDateTime getStartedAt(){return startedAt;} public void setStartedAt(LocalDateTime v){this.startedAt=v;}
public LocalDateTime getCompletedAt(){return completedAt;} public void setCompletedAt(LocalDateTime v){this.completedAt=v;}
public Status getStatus(){return status;} public void setStatus(Status v){this.status=v;}
}
