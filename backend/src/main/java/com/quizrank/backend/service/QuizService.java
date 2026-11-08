package com.quizrank.backend.service;

import com.quizrank.backend.dto.AnswerRequest;
import com.quizrank.backend.dto.CreateQuizRequest;
import com.quizrank.backend.dto.QuestionRequest;
import com.quizrank.backend.dto.StudentQuestionResponse;
import com.quizrank.backend.entity.*;
import com.quizrank.backend.repository.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;

@Service
public class QuizService {
    private static final long QUIZ_AVAILABILITY_HOURS = 1;

    private final QuizRepository quizzes;
    private final QuestionRepository questions;
    private final UserRepository users;
    private final SubjectRepository subjects;
    private final StudentCourseRepository studentCourses;
    private final QuizAttemptRepository attempts;
    private final QuizAttemptAnswerRepository answers;
    private final QuizResultRepository results;

    public QuizService(QuizRepository quizzes, QuestionRepository questions, UserRepository users,
                       SubjectRepository subjects, StudentCourseRepository studentCourses,
                       QuizAttemptRepository attempts, QuizAttemptAnswerRepository answers,
                       QuizResultRepository results) {
        this.quizzes = quizzes;
        this.questions = questions;
        this.users = users;
        this.subjects = subjects;
        this.studentCourses = studentCourses;
        this.attempts = attempts;
        this.answers = answers;
        this.results = results;
    }

    @Transactional
    public Quiz create(CreateQuizRequest request) {
        User teacher = users.findById(request.createdBy())
                .orElseThrow(() -> new NoSuchElementException("Teacher not found"));
        if (teacher.getRole() != User.Role.TEACHER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only teachers can create quizzes.");
        }
        Subject subject = subjects.findById(request.subjectId())
                .orElseThrow(() -> new NoSuchElementException("Subject not found"));
        if (subject.getTeacherId() != null && !subject.getTeacherId().equals(teacher.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this course.");
        }
        if (request.questions() == null || request.questions().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add at least one question.");
        }

        Quiz quiz = new Quiz();
        quiz.setSubjectId(request.subjectId());
        quiz.setTopic(request.topic().trim());
        quiz.setQuizDate(request.quizDate());
        quiz.setQuizTime(request.quizTime());
        quiz.setCreatedBy(request.createdBy());
        quiz.setTotalQuestions(request.questions().size());
        quiz = quizzes.saveAndFlush(quiz);

        for (QuestionRequest item : request.questions()) {
            Question question = new Question();
            question.setQuizId(quiz.getId());
            question.setQuestion(item.question().trim());
            question.setOptionA(item.optionA().trim());
            question.setOptionB(item.optionB().trim());
            question.setOptionC(item.optionC().trim());
            question.setOptionD(item.optionD().trim());
            question.setCorrectAnswer(item.correctAnswer().trim().toUpperCase(Locale.ROOT));
            questions.save(question);
        }
        return quiz;
    }

    @Transactional(readOnly = true)
    public List<StudentQuestionResponse> studentQuestions(Integer quizId) {
        if (!quizzes.existsById(quizId)) throw new NoSuchElementException("Quiz not found");
        return questions.findByQuizIdOrderById(quizId).stream()
                .map(StudentQuestionResponse::from).toList();
    }

    @Transactional
    public QuizAttempt start(Integer studentId, Integer quizId) {
        User student = users.findById(studentId)
                .orElseThrow(() -> new NoSuchElementException("Student not found"));
        if (student.getRole() != User.Role.STUDENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students can attempt quizzes.");
        }
        Quiz quiz = quizzes.findById(quizId)
                .orElseThrow(() -> new NoSuchElementException("Quiz not found"));

        if (!studentCourses.existsByStudentIdAndSubjectId(studentId, quiz.getSubjectId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not enrolled in this course.");
        }
        if (quiz.getCreatedAt() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Quiz creation time is missing. Contact your teacher.");
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime deadline = quiz.getCreatedAt().plusHours(QUIZ_AVAILABILITY_HOURS);
        if (now.isBefore(quiz.getCreatedAt())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This quiz is not available yet.");
        }
        if (!now.isBefore(deadline)) {
            throw new ResponseStatusException(HttpStatus.GONE, "The 1-hour quiz window has ended. You can no longer start this quiz.");
        }
        if (questions.countByQuizId(quizId) == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This quiz has no questions yet.");
        }
        if (attempts.existsByStudentIdAndQuizId(studentId, quizId)) {
            boolean completed = attempts.findFirstByStudentIdAndQuizIdAndStatus(
                    studentId, quizId, QuizAttempt.Status.COMPLETED).isPresent();
            String message = completed
                    ? "You have already attempted this quiz. Each quiz can be attempted only once."
                    : "You already have an attempt in progress. Continue your existing attempt.";
            throw new ResponseStatusException(HttpStatus.CONFLICT, message);
        }

        QuizAttempt attempt = new QuizAttempt();
        attempt.setStudentId(studentId);
        attempt.setQuizId(quizId);
        attempt.setCurrentQuestion(0);
        attempt.setScore(0);
        attempt.setQuestionStartedAt(now);
        attempt.setStatus(QuizAttempt.Status.IN_PROGRESS);
        try {
            return attempts.saveAndFlush(attempt);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "You have already attempted this quiz. Each quiz can be attempted only once.");
        }
    }

    @Transactional
    public QuizAttemptAnswer answer(Integer attemptId, AnswerRequest request) {
        QuizAttempt attempt = attempts.findById(attemptId)
                .orElseThrow(() -> new NoSuchElementException("Attempt not found"));
        if (attempt.getStatus() != QuizAttempt.Status.IN_PROGRESS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This quiz attempt is already completed.");
        }
        Question question = questions.findById(request.questionId())
                .orElseThrow(() -> new NoSuchElementException("Question not found"));
        if (!question.getQuizId().equals(attempt.getQuizId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question does not belong to this quiz.");
        }
        if (answers.findByAttemptIdAndQuestionId(attemptId, question.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This question has already been answered.");
        }
        int current = attempt.getCurrentQuestion() == null ? 0 : attempt.getCurrentQuestion();
        if (current >= questions.countByQuizId(attempt.getQuizId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "All quiz questions have already been answered.");
        }
        if (request.selectedAnswer() == null || !request.selectedAnswer().trim().matches("(?i)[ABCD]")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select one answer: A, B, C or D.");
        }
        String selected = request.selectedAnswer().trim().toUpperCase(Locale.ROOT);
        boolean correct = question.getCorrectAnswer().equalsIgnoreCase(selected);
        QuizAttemptAnswer answer = new QuizAttemptAnswer();
        answer.setAttemptId(attemptId);
        answer.setQuestionId(question.getId());
        answer.setSelectedAnswer(selected);
        answer.setIsCorrect(correct);
        answers.save(answer);

        int score = attempt.getScore() == null ? 0 : attempt.getScore();
        attempt.setScore(correct ? score + 1 : score);
        attempt.setCurrentQuestion(current + 1);
        attempt.setQuestionStartedAt(LocalDateTime.now());
        attempts.save(attempt);
        return answer;
    }

    @Transactional
    public QuizResult finish(Integer attemptId) {
        QuizAttempt attempt = attempts.findById(attemptId)
                .orElseThrow(() -> new NoSuchElementException("Attempt not found"));
        if (attempt.getStatus() == QuizAttempt.Status.COMPLETED) {
            return results.findByStudentIdAndQuizId(attempt.getStudentId(), attempt.getQuizId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Attempt is completed but its result is missing."));
        }
        int total = (int) questions.countByQuizId(attempt.getQuizId());
        attempt.setStatus(QuizAttempt.Status.COMPLETED);
        attempt.setCompletedAt(LocalDateTime.now());
        attempts.save(attempt);
        QuizResult result = new QuizResult();
        result.setStudentId(attempt.getStudentId());
        result.setQuizId(attempt.getQuizId());
        result.setScore(attempt.getScore() == null ? 0 : attempt.getScore());
        result.setTotal(total);
        return results.save(result);
    }
}
