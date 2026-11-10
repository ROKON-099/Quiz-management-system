package com.quizrank.backend.dto;

public record AttemptStatusResponse(
        boolean attempted,
        boolean inProgress,
        Integer attemptId,
        Integer score,
        Integer total,
        Double percentage,
        String status
) {}