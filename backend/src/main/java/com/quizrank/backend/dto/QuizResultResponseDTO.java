package com.quizrank.backend.dto;

import java.time.LocalDateTime;

public class QuizResultResponseDTO {

    private Integer id;
    private Integer studentId;
    private String studentName;
    private Integer quizId;
    private Integer score;
    private Integer total;
    private Double percentage;
    private LocalDateTime submittedAt;

    public QuizResultResponseDTO(
            Integer id,
            Integer studentId,
            String studentName,
            Integer quizId,
            Integer score,
            Integer total,
            LocalDateTime submittedAt
    ) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.quizId = quizId;
        this.score = score;
        this.total = total;
        this.submittedAt = submittedAt;

        this.percentage = total != null && total > 0
                ? (score * 100.0) / total
                : 0.0;
    }

    public Integer getId() {
        return id;
    }

    public Integer getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public Integer getQuizId() {
        return quizId;
    }

    public Integer getScore() {
        return score;
    }

    public Integer getTotal() {
        return total;
    }

    public Double getPercentage() {
        return percentage;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
}