package com.quizrank.backend.dto;
import com.quizrank.backend.entity.User;
public record UserResponse(Integer id,String userId,String name,User.Role role,String department,String batch) { public static UserResponse from(User u){return new UserResponse(u.getId(),u.getUserId(),u.getName(),u.getRole(),u.getDepartment(),u.getBatch());} }
