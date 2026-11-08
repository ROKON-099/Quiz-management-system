package com.quizrank.backend.entity;
import jakarta.persistence.*; import com.fasterxml.jackson.annotation.JsonIgnore; import java.time.*; import java.math.BigDecimal;
@Entity @Table(name="quiz_attempt_answers")
public class QuizAttemptAnswer {
@Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
@Column(name="attempt_id",nullable=false) private Integer attemptId;
@Column(name="question_id",nullable=false) private Integer questionId;
@Column(name="selected_answer",length=1) private String selectedAnswer;
@Column(name="is_correct") private Boolean isCorrect=false;
@Column(name="answered_at",insertable=false,updatable=false) private LocalDateTime answeredAt;
public QuizAttemptAnswer(){} public Integer getId(){return id;} public void setId(Integer id){this.id=id;}


public Integer getAttemptId(){return attemptId;} public void setAttemptId(Integer v){this.attemptId=v;}
public Integer getQuestionId(){return questionId;} public void setQuestionId(Integer v){this.questionId=v;}
public String getSelectedAnswer(){return selectedAnswer;} public void setSelectedAnswer(String v){this.selectedAnswer=v;}
public Boolean getIsCorrect(){return isCorrect;} public void setIsCorrect(Boolean v){this.isCorrect=v;}
public LocalDateTime getAnsweredAt(){return answeredAt;} public void setAnsweredAt(LocalDateTime v){this.answeredAt=v;}
}
