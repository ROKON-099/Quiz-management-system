package com.quizrank.backend.service;
import com.quizrank.backend.entity.User; import com.quizrank.backend.repository.UserRepository; import com.quizrank.backend.dto.*; import org.springframework.stereotype.Service; import java.util.*;
@Service public class UserService { private final UserRepository repo; public UserService(UserRepository r){repo=r;}
public LoginResponse login(LoginRequest req){User u=repo.findByUserId(req.userId()).orElseThrow(()->new NoSuchElementException("Invalid user ID or password")); if(!u.getPassword().equals(req.password())) throw new NoSuchElementException("Invalid user ID or password"); return new LoginResponse("Login successful",UserResponse.from(u));}
public UserResponse get(Integer id){return UserResponse.from(repo.findById(id).orElseThrow(()->new NoSuchElementException("User not found")));}
public List<UserResponse> byRole(User.Role role){return repo.findByRole(role).stream().map(UserResponse::from).toList();}
}
