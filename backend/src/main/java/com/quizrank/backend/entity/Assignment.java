package com.quizrank.backend.entity;
import jakarta.persistence.*; import java.time.*;
@Entity @Table(name="assignments") public class Assignment {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
 @Column(name="teacher_id",nullable=false) private Integer teacherId;
 @Column(name="subject_id") private Integer subjectId;
 @Column(nullable=false,length=180) private String title;
 @Column(columnDefinition="TEXT") private String description;
 @Column(name="due_date") private LocalDate dueDate;
 @Column(name="file_name",nullable=false) private String fileName;
 @Column(name="stored_name",nullable=false) private String storedName;
 @Column(name="created_at",insertable=false,updatable=false) private LocalDateTime createdAt;
 public Assignment(){} public Integer getId(){return id;} public Integer getTeacherId(){return teacherId;} public void setTeacherId(Integer v){teacherId=v;} public Integer getSubjectId(){return subjectId;} public void setSubjectId(Integer v){subjectId=v;} public String getTitle(){return title;} public void setTitle(String v){title=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;} public LocalDate getDueDate(){return dueDate;} public void setDueDate(LocalDate v){dueDate=v;} public String getFileName(){return fileName;} public void setFileName(String v){fileName=v;} public String getStoredName(){return storedName;} public void setStoredName(String v){storedName=v;} public LocalDateTime getCreatedAt(){return createdAt;}
}
