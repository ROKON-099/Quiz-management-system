import api from "./api";

// Get all quizzes
export const getQuizzes = async () =>
  (await api.get("/quizzes")).data;

// Get a single quiz
export const getQuiz = async (id) =>
  (await api.get(`/quizzes/${id}`)).data;

// Get quiz questions
export const getQuizQuestions = async (id) =>
  (await api.get(`/quizzes/${id}/questions`)).data;

// Create quiz
export const createQuiz = async (payload) =>
  (await api.post("/quizzes", payload)).data;

// Start or resume an attempt
export const startAttempt = async (studentId, quizId) =>
  (
    await api.post("/attempts/start", null, {
      params: { studentId, quizId },
    })
  ).data;

// Submit an answer
export const submitAnswer = async (attemptId, payload) =>
  (await api.post(`/attempts/${attemptId}/answer`, payload)).data;

// Finish an attempt
export const finishAttempt = async (attemptId) =>
  (await api.post(`/attempts/${attemptId}/finish`)).data;

// Check whether student already attempted this quiz
export const checkAttempt = async (studentId, quizId) =>
  (
    await api.get("/attempts/check", {
      params: { studentId, quizId },
    })
  ).data;