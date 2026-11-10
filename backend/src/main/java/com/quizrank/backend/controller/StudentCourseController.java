package com.quizrank.backend.controller;

import com.quizrank.backend.entity.*;
import com.quizrank.backend.repository.*;

import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/student-courses")
public class StudentCourseController {

    private final StudentCourseRepository courses;
    private final SubjectRepository subjects;

    public StudentCourseController(
            StudentCourseRepository courses,
            SubjectRepository subjects) {
        this.courses = courses;
        this.subjects = subjects;
    }

    @GetMapping("/student/{studentId}")
    public List<Map<String, Object>> byStudent(
            @PathVariable Integer studentId) {

        return courses.findByStudentId(studentId)
                .stream()
                .map(c -> {

                    Map<String, Object> m = new LinkedHashMap<>();

                    m.put("enrollmentId", c.getId());
                    m.put("enrolledType", c.getEnrolledType());

                    Subject subject = subjects
                            .findById(c.getSubjectId())
                            .orElse(null);

                    m.put("subject", subject);

                    return m;

                })
                .toList();
    }
}