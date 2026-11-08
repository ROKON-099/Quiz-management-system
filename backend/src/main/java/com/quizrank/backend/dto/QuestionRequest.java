package com.quizrank.backend.dto;
import jakarta.validation.constraints.*;
public record QuestionRequest(@NotBlank String question,@NotBlank String optionA,@NotBlank String optionB,@NotBlank String optionC,@NotBlank String optionD,@Pattern(regexp="[ABCDabcd]") String correctAnswer) {}
