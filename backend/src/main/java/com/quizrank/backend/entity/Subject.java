package com.quizrank.backend.entity;
import jakarta.persistence.*; import com.fasterxml.jackson.annotation.JsonIgnore; import java.time.*; import java.math.BigDecimal;
@Entity @Table(name="subjects")
public class Subject {
@Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
@Column(nullable=false,length=100) private String name;
@Column(name="teacher_id") private Integer teacherId;
@Column(length=20) private String batch;
public Subject(){} public Integer getId(){return id;} public void setId(Integer id){this.id=id;}


public String getName(){return name;} public void setName(String v){this.name=v;}
public Integer getTeacherId(){return teacherId;} public void setTeacherId(Integer v){this.teacherId=v;}
public String getBatch(){return batch;} public void setBatch(String v){this.batch=v;}
}
