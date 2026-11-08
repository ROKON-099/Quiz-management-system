package com.quizrank.backend.entity;
import jakarta.persistence.*; import com.fasterxml.jackson.annotation.JsonIgnore; import java.time.*; import java.math.BigDecimal;
@Entity @Table(name="questions")
public class Question {
@Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
@Column(name="quiz_id",nullable=false) private Integer quizId;
@Column(nullable=false,columnDefinition="TEXT") private String question;
@Column(name="option_a",nullable=false,length=500) private String optionA;
@Column(name="option_b",nullable=false,length=500) private String optionB;
@Column(name="option_c",nullable=false,length=500) private String optionC;
@Column(name="option_d",nullable=false,length=500) private String optionD;
@JsonIgnore @Column(name="correct_answer",nullable=false,length=1) private String correctAnswer;
public Question(){} public Integer getId(){return id;} public void setId(Integer id){this.id=id;}


public Integer getQuizId(){return quizId;} public void setQuizId(Integer v){this.quizId=v;}
public String getQuestion(){return question;} public void setQuestion(String v){this.question=v;}
public String getOptionA(){return optionA;} public void setOptionA(String v){this.optionA=v;}
public String getOptionB(){return optionB;} public void setOptionB(String v){this.optionB=v;}
public String getOptionC(){return optionC;} public void setOptionC(String v){this.optionC=v;}
public String getOptionD(){return optionD;} public void setOptionD(String v){this.optionD=v;}
public String getCorrectAnswer(){return correctAnswer;} public void setCorrectAnswer(String v){this.correctAnswer=v;}
}
