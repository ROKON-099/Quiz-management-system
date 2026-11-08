package com.quizrank.backend.repository;
import com.quizrank.backend.entity.Notice; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface NoticeRepository extends JpaRepository<Notice,Integer> { List<Notice> findByTeacherIdOrderByCreatedAtDesc(Integer teacherId); }
