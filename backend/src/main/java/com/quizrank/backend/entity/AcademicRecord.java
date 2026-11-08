package com.quizrank.backend.entity;
import jakarta.persistence.*; import com.fasterxml.jackson.annotation.JsonIgnore; import java.time.*; import java.math.BigDecimal;
@Entity @Table(name="academic_records")
public class AcademicRecord {
@Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
@Column(name="student_id",nullable=false) private Integer studentId;
@Column(length=50) private String semester;
@Column(precision=4,scale=2) private BigDecimal cgpa;
@Column(name="department_rank") private Integer departmentRank;
@Column(name="batch_rank") private Integer batchRank;
public AcademicRecord(){} public Integer getId(){return id;} public void setId(Integer id){this.id=id;}


public Integer getStudentId(){return studentId;} public void setStudentId(Integer v){this.studentId=v;}
public String getSemester(){return semester;} public void setSemester(String v){this.semester=v;}
public BigDecimal getCgpa(){return cgpa;} public void setCgpa(BigDecimal v){this.cgpa=v;}
public Integer getDepartmentRank(){return departmentRank;} public void setDepartmentRank(Integer v){this.departmentRank=v;}
public Integer getBatchRank(){return batchRank;} public void setBatchRank(Integer v){this.batchRank=v;}
}
