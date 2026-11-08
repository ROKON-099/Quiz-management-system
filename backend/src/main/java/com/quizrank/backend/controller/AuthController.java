package com.quizrank.backend.controller;
import com.quizrank.backend.dto.*; import com.quizrank.backend.service.UserService; import jakarta.validation.Valid; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") public class AuthController {private final UserService s; public AuthController(UserService s){this.s=s;} @PostMapping("/login") public LoginResponse login(@Valid @RequestBody LoginRequest r){return s.login(r);} }
