package com.quizrank.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "student_id", nullable = false)
    private Integer studentId;

    @Column(name = "quiz_id", nullable = false)
    private Integer quizId;

    @Column(name = "current_question")
    private Integer currentQuestion = 0;

    private Integer score = 0;

    @Column(name = "question_started_at", nullable = false)
    private LocalDateTime questionStartedAt;

    @Column(name = "started_at", insertable = false, updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Enumerated(EnumType.STRING)
    private Status status = Status.IN_PROGRESS;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quiz_id", referencedColumnName = "id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Quiz quiz;

    public enum Status { IN_PROGRESS, COMPLETED }
    public QuizAttempt() { }
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getStudentId() { return studentId; }
    public void setStudentId(Integer studentId) { this.studentId = studentId; }
    public Integer getQuizId() { return quizId; }
    public void setQuizId(Integer quizId) { this.quizId = quizId; }
    public Integer getCurrentQuestion() { return currentQuestion; }
    public void setCurrentQuestion(Integer currentQuestion) { this.currentQuestion = currentQuestion; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public LocalDateTime getQuestionStartedAt() { return questionStartedAt; }
    public void setQuestionStartedAt(LocalDateTime questionStartedAt) { this.questionStartedAt = questionStartedAt; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }
}
