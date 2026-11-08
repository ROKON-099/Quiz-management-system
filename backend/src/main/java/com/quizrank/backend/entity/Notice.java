package com.quizrank.backend.entity;
import jakarta.persistence.*; import com.fasterxml.jackson.annotation.JsonIgnore; import java.time.*; import java.math.BigDecimal;
@Entity @Table(name="notices")
public class Notice {
@Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
@Column(name="teacher_id",nullable=false) private Integer teacherId;
@Column(name="subject_id") private Integer subjectId;
@Column(nullable=false,length=150) private String topic;
@Column(nullable=false,columnDefinition="TEXT") private String message;
@Column(name="quiz_date") private LocalDate quizDate;
@Column(name="quiz_time") private LocalTime quizTime;
@Column(name="created_at",insertable=false,updatable=false) private LocalDateTime createdAt;
public Notice(){} public Integer getId(){return id;} public void setId(Integer id){this.id=id;}


public Integer getTeacherId(){return teacherId;} public void setTeacherId(Integer v){this.teacherId=v;}
public Integer getSubjectId(){return subjectId;} public void setSubjectId(Integer v){this.subjectId=v;}
public String getTopic(){return topic;} public void setTopic(String v){this.topic=v;}
public String getMessage(){return message;} public void setMessage(String v){this.message=v;}
public LocalDate getQuizDate(){return quizDate;} public void setQuizDate(LocalDate v){this.quizDate=v;}
public LocalTime getQuizTime(){return quizTime;} public void setQuizTime(LocalTime v){this.quizTime=v;}
public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){this.createdAt=v;}
}
