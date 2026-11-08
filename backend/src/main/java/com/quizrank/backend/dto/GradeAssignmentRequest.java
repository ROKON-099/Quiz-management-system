package com.quizrank.backend.dto;
import com.quizrank.backend.entity.AssignmentResult;
import jakarta.validation.constraints.NotNull;
public record GradeAssignmentRequest(@NotNull AssignmentResult.Grade grade, String feedback) {}
