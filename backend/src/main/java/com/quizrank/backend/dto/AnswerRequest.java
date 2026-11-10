package com.quizrank.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/** selectedAnswer may be null when the 30-second timer expires. */
public record AnswerRequest(
        @NotNull Integer questionId,
        @Pattern(regexp = "[ABCDabcd]", message = "Selected answer must be A, B, C or D")
        String selectedAnswer
) {}
