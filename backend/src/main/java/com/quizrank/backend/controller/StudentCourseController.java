package com.quizrank.backend.controller;

import com.quizrank.backend.entity.Quiz;
import com.quizrank.backend.entity.QuizResult;
import com.quizrank.backend.entity.StudentCourse;
import com.quizrank.backend.entity.Subject;
import com.quizrank.backend.repository.QuizRepository;
import com.quizrank.backend.repository.QuizResultRepository;
import com.quizrank.backend.repository.StudentCourseRepository;
import com.quizrank.backend.repository.SubjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student-courses")
public class StudentCourseController {
    private final StudentCourseRepository courses;
    private final SubjectRepository subjects;
    private final QuizRepository quizzes;
    private final QuizResultRepository results;

    public StudentCourseController(StudentCourseRepository courses, SubjectRepository subjects,
                                   QuizRepository quizzes, QuizResultRepository results) {
        this.courses = courses;
        this.subjects = subjects;
        this.quizzes = quizzes;
        this.results = results;
    }

    @GetMapping("/student/{studentId}")
    public List<Map<String, Object>> byStudent(@PathVariable Integer studentId) {
        List<QuizResult> studentResults = results.findByStudentIdOrderBySubmittedAtDesc(studentId);
        Map<Integer, QuizResult> latestResultByQuiz = studentResults.stream()
                .collect(Collectors.toMap(QuizResult::getQuizId, r -> r, (first, second) -> first));

        return courses.findByStudentId(studentId).stream().map(enrollment -> {
            Subject subject = subjects.findById(enrollment.getSubjectId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Subject not found for enrollment " + enrollment.getId()));
            List<Quiz> subjectQuizzes = quizzes.findBySubjectId(subject.getId());
            List<QuizResult> courseResults = subjectQuizzes.stream()
                    .map(Quiz::getId)
                    .map(latestResultByQuiz::get)
                    .filter(Objects::nonNull)
                    .toList();

            long earned = courseResults.stream().mapToLong(r -> safe(r.getScore())).sum();
            long possible = courseResults.stream().mapToLong(r -> safe(r.getTotal())).sum();
            Double averageMark = possible == 0 ? null : Math.round((earned * 10000.0 / possible)) / 100.0;

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", subject.getId());
            row.put("enrollmentId", enrollment.getId());
            row.put("studentId", enrollment.getStudentId());
            row.put("subjectId", subject.getId());
            row.put("enrolledType", enrollment.getEnrolledType());
            row.put("name", subject.getName());
            row.put("courseName", subject.getName());
            row.put("courseCode", subject.getCourseCode());
            row.put("batch", subject.getBatch());
            row.put("teacherId", subject.getTeacherId());
            row.put("subject", subject);
            row.put("totalQuizzes", subjectQuizzes.size());
            row.put("completedQuizzes", courseResults.size());
            row.put("averageMark", averageMark);
            return row;
        }).toList();
    }

    private int safe(Integer value) { return value == null ? 0 : value; }
}
