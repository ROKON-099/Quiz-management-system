package com.quizrank.backend.entity;
import jakarta.persistence.*; import com.fasterxml.jackson.annotation.JsonIgnore; import java.time.*; import java.math.BigDecimal;
@Entity @Table(name="student_courses")
public class StudentCourse {
@Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
@Column(name="student_id",nullable=false) private Integer studentId;
@Column(name="subject_id",nullable=false) private Integer subjectId;
@Column(name="enrolled_type",length=30) private String enrolledType;
public StudentCourse(){} public Integer getId(){return id;} public void setId(Integer id){this.id=id;}


public Integer getStudentId(){return studentId;} public void setStudentId(Integer v){this.studentId=v;}
public Integer getSubjectId(){return subjectId;} public void setSubjectId(Integer v){this.subjectId=v;}
public String getEnrolledType(){return enrolledType;} public void setEnrolledType(String v){this.enrolledType=v;}
}
