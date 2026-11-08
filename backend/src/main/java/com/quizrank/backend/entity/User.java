package com.quizrank.backend.entity;
import jakarta.persistence.*; import com.fasterxml.jackson.annotation.JsonIgnore; import java.time.*; import java.math.BigDecimal;
@Entity @Table(name="users")
public class User {
@Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
@Column(name="user_id", unique=true, nullable=false, length=50) private String userId;
@Column(nullable=false,length=100) private String name;
@JsonIgnore @Column(nullable=false) private String password;
@Enumerated(EnumType.STRING) @Column(nullable=false) private Role role;
@Column(nullable=false,length=100) private String department;
@Column(length=20) private String batch;
@Column(name="created_at",insertable=false,updatable=false) private LocalDateTime createdAt;
public enum Role { STUDENT, TEACHER }
public User(){} public Integer getId(){return id;} public void setId(Integer id){this.id=id;}


public String getUserId(){return userId;} public void setUserId(String v){this.userId=v;}
public String getName(){return name;} public void setName(String v){this.name=v;}
public String getPassword(){return password;} public void setPassword(String v){this.password=v;}
public Role getRole(){return role;} public void setRole(Role v){this.role=v;}
public String getDepartment(){return department;} public void setDepartment(String v){this.department=v;}
public String getBatch(){return batch;} public void setBatch(String v){this.batch=v;}
public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){this.createdAt=v;}
}
