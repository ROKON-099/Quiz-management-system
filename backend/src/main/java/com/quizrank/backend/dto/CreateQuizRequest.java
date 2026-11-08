package com.quizrank.backend.dto;
import jakarta.validation.Valid; import jakarta.validation.constraints.*; import java.time.*; import java.util.*;
public record CreateQuizRequest(@NotNull Integer subjectId,@NotBlank String topic,@NotNull LocalDate quizDate,@NotNull LocalTime quizTime,@NotNull Integer createdBy,@NotEmpty @Size(min=1,max=10) List<@Valid QuestionRequest> questions) {}
