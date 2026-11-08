package com.quizrank.backend.repository;
import com.quizrank.backend.entity.User; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface UserRepository extends JpaRepository<User,Integer> { Optional<User> findByUserId(String userId); List<User> findByRole(User.Role role); }
