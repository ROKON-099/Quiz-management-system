package com.quizrank.backend.dto;

import java.time.LocalDateTime;

public record QuizResultRow(
        Integer id,
        Integer studentId,
        String userId,
        String studentName,
        Integer quizId,
        Integer score,
        Integer total,
        Double percentage,
        LocalDateTime submittedAt
) {}
