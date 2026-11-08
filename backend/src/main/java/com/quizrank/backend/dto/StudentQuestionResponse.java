package com.quizrank.backend.dto;
import com.quizrank.backend.entity.Question;
public record StudentQuestionResponse(Integer id,String question,String optionA,String optionB,String optionC,String optionD) { public static StudentQuestionResponse from(Question q){return new StudentQuestionResponse(q.getId(),q.getQuestion(),q.getOptionA(),q.getOptionB(),q.getOptionC(),q.getOptionD());} }
