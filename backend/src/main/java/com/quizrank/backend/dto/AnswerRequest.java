package com.quizrank.backend.dto;
import jakarta.validation.constraints.*;
public record AnswerRequest(@NotNull Integer questionId,@NotBlank @Pattern(regexp="[ABCDabcd]") String selectedAnswer) {}
