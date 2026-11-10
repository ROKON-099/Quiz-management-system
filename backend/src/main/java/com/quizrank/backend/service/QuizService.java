package com.quizrank.backend.service;

import com.quizrank.backend.dto.*;
import com.quizrank.backend.entity.*;
import com.quizrank.backend.repository.*;

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

    private final QuizRepository quizzes;
    private final QuestionRepository questions;
    private final UserRepository users;
    private final SubjectRepository subjects;
    private final QuizAttemptRepository attempts;
    private final QuizAttemptAnswerRepository answers;
    private final QuizResultRepository results;

    public QuizService(
            QuizRepository q,
            QuestionRepository qu,
            UserRepository u,
            SubjectRepository s,
            QuizAttemptRepository a,
            QuizAttemptAnswerRepository aa,
            QuizResultRepository r
    ) {
        quizzes = q;
        questions = qu;
        users = u;
        subjects = s;
        attempts = a;
        answers = aa;
        results = r;
    }

    // ==========================================
    // CREATE QUIZ
    // ==========================================

    @Transactional
    public Quiz create(CreateQuizRequest req) {

        User teacher = users.findById(req.createdBy())
                .orElseThrow(() ->
                        new NoSuchElementException("Teacher not found"));

        if (teacher.getRole() != User.Role.TEACHER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only teachers can create quizzes"
            );
        }

        if (!subjects.existsById(req.subjectId())) {
            throw new NoSuchElementException("Subject not found");
        }

        if (req.questions() == null
                || req.questions().isEmpty()
                || req.questions().size() > 10) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A quiz must contain 1 to 10 questions"
            );
        }

        Quiz quiz = new Quiz();

        quiz.setSubjectId(req.subjectId());
        quiz.setTopic(req.topic().trim());
        quiz.setQuizDate(req.quizDate());
        quiz.setQuizTime(req.quizTime());
        quiz.setCreatedBy(req.createdBy());
        quiz.setTotalQuestions(req.questions().size());

        quiz = quizzes.saveAndFlush(quiz);

        for (QuestionRequest item : req.questions()) {

            if (item.correctAnswer() == null
                    || !item.correctAnswer().matches("(?i)[ABCD]")) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Correct answer must be A, B, C or D"
                );
            }

            Question question = new Question();

            question.setQuizId(quiz.getId());
            question.setQuestion(item.question().trim());
            question.setOptionA(item.optionA().trim());
            question.setOptionB(item.optionB().trim());
            question.setOptionC(item.optionC().trim());
            question.setOptionD(item.optionD().trim());

            question.setCorrectAnswer(
                    item.correctAnswer().toUpperCase(Locale.ROOT)
            );

            questions.save(question);
        }

        return quiz;
    }

    // ==========================================
    // GET STUDENT QUESTIONS
    // ==========================================

    @Transactional(readOnly = true)
    public List<StudentQuestionResponse> studentQuestions(
            Integer quizId
    ) {

        if (!quizzes.existsById(quizId)) {
            throw new NoSuchElementException("Quiz not found");
        }

        return questions.findByQuizIdOrderById(quizId)
                .stream()
                .map(StudentQuestionResponse::from)
                .toList();
    }

    // ==========================================
    // START QUIZ
    // ==========================================

    @Transactional
    public QuizAttempt start(
            Integer studentId,
            Integer quizId
    ) {

        // Check student
        User student = users.findById(studentId)
                .orElseThrow(() ->
                        new NoSuchElementException("Student not found"));

        if (student.getRole() != User.Role.STUDENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only students can attempt quizzes"
            );
        }

        // Check quiz
        Quiz quiz = quizzes.findById(quizId)
                .orElseThrow(() ->
                        new NoSuchElementException("Quiz not found"));

        // Check existing attempt FIRST
        QuizAttempt existingAttempt = attempts
                .findFirstByStudentIdAndQuizId(studentId, quizId)
                .orElse(null);

        if (existingAttempt != null) {

            // Resume previous attempt
            if (existingAttempt.getStatus()
                    == QuizAttempt.Status.IN_PROGRESS) {

                return existingAttempt;
            }

            // Completed quiz cannot be attempted again
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already completed this quiz. Second attempt is not allowed."
            );
        }

        // Check quiz schedule for new attempts
        if (quiz.getQuizDate() == null
                || quiz.getQuizTime() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quiz schedule is incomplete"
            );
        }

        LocalDateTime quizStartTime =
                LocalDateTime.of(
                        quiz.getQuizDate(),
                        quiz.getQuizTime()
                );

        if (LocalDateTime.now().isBefore(quizStartTime)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Quiz has not started yet"
            );
        }

        // Check questions
        if (questions.countByQuizId(quizId) == 0) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This quiz has no questions yet"
            );
        }

        // Create new attempt
        QuizAttempt attempt = new QuizAttempt();

        attempt.setStudentId(studentId);
        attempt.setQuizId(quizId);
        attempt.setCurrentQuestion(0);
        attempt.setScore(0);
        attempt.setQuestionStartedAt(LocalDateTime.now());
        attempt.setStatus(QuizAttempt.Status.IN_PROGRESS);

        return attempts.save(attempt);
    }

    // ==========================================
    // CHECK PREVIOUS ATTEMPT
    // ==========================================

    @Transactional(readOnly = true)
    public AttemptStatusResponse checkAttempt(
            Integer studentId,
            Integer quizId
    ) {

        // Check student
        User student = users.findById(studentId)
                .orElseThrow(() ->
                        new NoSuchElementException("Student not found"));

        if (student.getRole() != User.Role.STUDENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only students can check quiz attempts"
            );
        }

        // Check quiz
        if (!quizzes.existsById(quizId)) {
            throw new NoSuchElementException("Quiz not found");
        }

        // Find previous attempt
        QuizAttempt attempt = attempts
                .findFirstByStudentIdAndQuizId(studentId, quizId)
                .orElse(null);

        // Not attempted
        if (attempt == null) {

            return new AttemptStatusResponse(
                    false,
                    false,
                    null,
                    null,
                    null,
                    null,
                    "NOT_ATTEMPTED"
            );
        }

        // Quiz is running
        if (attempt.getStatus()
                == QuizAttempt.Status.IN_PROGRESS) {

            return new AttemptStatusResponse(
                    false,
                    true,
                    attempt.getId(),
                    null,
                    null,
                    null,
                    "IN_PROGRESS"
            );
        }

        // Find previous result
        QuizResult result = results
                .findFirstByStudentIdAndQuizId(studentId, quizId)
                .orElse(null);

        if (result == null) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Attempt completed but result not found"
            );
        }

        double percentage = result.getTotal() != null
                && result.getTotal() > 0
                ? result.getScore() * 100.0 / result.getTotal()
                : 0.0;

        // Completed result
        return new AttemptStatusResponse(
                true,
                false,
                attempt.getId(),
                result.getScore(),
                result.getTotal(),
                percentage,
                "COMPLETED"
        );
    }

    // ==========================================
    // SUBMIT ANSWER
    // ==========================================

    @Transactional
    public QuizAttemptAnswer answer(
            Integer attemptId,
            AnswerRequest req
    ) {

        QuizAttempt attempt = attempts.findById(attemptId)
                .orElseThrow(() ->
                        new NoSuchElementException("Attempt not found"));

        if (attempt.getStatus()
                != QuizAttempt.Status.IN_PROGRESS) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Attempt already completed"
            );
        }

        Question question = questions.findById(req.questionId())
                .orElseThrow(() ->
                        new NoSuchElementException("Question not found"));

        // Verify question belongs to this quiz
        if (!question.getQuizId().equals(attempt.getQuizId())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Question does not belong to this quiz"
            );
        }

        // Prevent duplicate answer
        if (answers.findByAttemptIdAndQuestionId(
                attemptId,
                question.getId()
        ).isPresent()) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Question already answered"
            );
        }

        String selected =
                req.selectedAnswer() == null
                        || req.selectedAnswer().isBlank()
                        ? null
                        : req.selectedAnswer()
                                .trim()
                                .toUpperCase(Locale.ROOT);

        if (selected != null && !selected.matches("[ABCD]")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected answer must be A, B, C or D"
            );
        }

        boolean correct = selected != null
                && question.getCorrectAnswer()
                        .equalsIgnoreCase(selected);

        QuizAttemptAnswer answer = new QuizAttemptAnswer();

        answer.setAttemptId(attemptId);
        answer.setQuestionId(question.getId());
        answer.setSelectedAnswer(selected);
        answer.setIsCorrect(correct);

        answers.save(answer);

        // Update score
        if (attempt.getScore() == null) {
            attempt.setScore(0);
        }

        if (attempt.getCurrentQuestion() == null) {
            attempt.setCurrentQuestion(0);
        }

        if (correct) {
            attempt.setScore(attempt.getScore() + 1);
        }

        attempt.setCurrentQuestion(
                attempt.getCurrentQuestion() + 1
        );

        attempt.setQuestionStartedAt(LocalDateTime.now());

        attempts.save(attempt);

        return answer;
    }

    // ==========================================
    // FINISH QUIZ
    // ==========================================

    @Transactional
    public QuizResult finish(Integer attemptId) {

        QuizAttempt attempt = attempts.findById(attemptId)
                .orElseThrow(() ->
                        new NoSuchElementException("Attempt not found"));

        // If already completed, return previous result
        if (attempt.getStatus()
                == QuizAttempt.Status.COMPLETED) {

            return results
                    .findFirstByStudentIdAndQuizId(
                            attempt.getStudentId(),
                            attempt.getQuizId()
                    )
                    .orElseThrow(() ->
                            new ResponseStatusException(
                                    HttpStatus.CONFLICT,
                                    "Previous result not found"
                            ));
        }

        // Calculate total questions
        int total = (int) questions.countByQuizId(
                attempt.getQuizId()
        );

        // Update attempt status
        attempt.setStatus(QuizAttempt.Status.COMPLETED);
        attempt.setCompletedAt(LocalDateTime.now());

        attempts.save(attempt);

        // Save result
        QuizResult result = new QuizResult();

        result.setStudentId(attempt.getStudentId());
        result.setQuizId(attempt.getQuizId());
        result.setScore(
                attempt.getScore() == null
                        ? 0
                        : attempt.getScore()
        );
        result.setTotal(total);

        return results.save(result);
    }
}