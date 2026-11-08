import api from "./api";
export const getQuizzes = async () => (await api.get("/quizzes")).data;
export const getQuiz = async (id) => (await api.get(`/quizzes/${id}`)).data;
export const getQuizQuestions = async (id) => (await api.get(`/quizzes/${id}/questions`)).data;
export const createQuiz = async (payload) => (await api.post("/quizzes", payload)).data;
export const startAttempt = async (studentId, quizId) =>
  (await api.post("/attempts/start", null, { params: { studentId, quizId } })).data;
export const submitAnswer = async (attemptId, payload) =>
  (await api.post(`/attempts/${attemptId}/answer`, payload)).data;
export const finishAttempt = async (attemptId) =>
  (await api.post(`/attempts/${attemptId}/finish`)).data;
