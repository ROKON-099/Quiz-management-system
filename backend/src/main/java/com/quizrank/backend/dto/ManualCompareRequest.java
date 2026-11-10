package com.quizrank.backend.dto;
import jakarta.validation.constraints.NotNull;
public record ManualCompareRequest(@NotNull Integer submissionAId,@NotNull Integer submissionBId,@NotNull Integer teacherId) {}
