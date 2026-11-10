package com.quizrank.backend.dto;

public class CourseResultDTO {

    private Integer courseId;
    private Integer quizId;
    private Integer score;
    private Integer total;
    private Double percentage;

    public CourseResultDTO(
            Integer courseId,
            Integer quizId,
            Integer score,
            Integer total
    ) {
        this.courseId = courseId;
        this.quizId = quizId;
        this.score = score;
        this.total = total;

        this.percentage = total != null && total > 0
                ? (score * 100.0) / total
                : 0.0;
    }

    public Integer getCourseId() {
        return courseId;
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
}