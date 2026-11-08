package com.quizrank.backend.entity;
import jakarta.persistence.*; import com.fasterxml.jackson.annotation.JsonIgnore; import java.time.*; import java.math.BigDecimal;
@Entity @Table(name="quizzes")
public class Quiz {
@Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
@Column(name="subject_id",nullable=false) private Integer subjectId;
@Column(nullable=false,length=150) private String topic;
@Column(name="quiz_date",nullable=false) private LocalDate quizDate;
@Column(name="quiz_time",nullable=false) private LocalTime quizTime;
@Column(name="total_questions") private Integer totalQuestions=10;
@Column(name="created_by",nullable=false) private Integer createdBy;
@Column(name="created_at",insertable=false,updatable=false) private LocalDateTime createdAt;
public Quiz(){} public Integer getId(){return id;} public void setId(Integer id){this.id=id;}


public Integer getSubjectId(){return subjectId;} public void setSubjectId(Integer v){this.subjectId=v;}
public String getTopic(){return topic;} public void setTopic(String v){this.topic=v;}
public LocalDate getQuizDate(){return quizDate;} public void setQuizDate(LocalDate v){this.quizDate=v;}
public LocalTime getQuizTime(){return quizTime;} public void setQuizTime(LocalTime v){this.quizTime=v;}
public Integer getTotalQuestions(){return totalQuestions;} public void setTotalQuestions(Integer v){this.totalQuestions=v;}
public Integer getCreatedBy(){return createdBy;} public void setCreatedBy(Integer v){this.createdBy=v;}
public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){this.createdAt=v;}
}
