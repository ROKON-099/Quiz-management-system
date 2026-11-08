import api from "./api";

export const getStudentResults = async (studentId) =>
  (await api.get(`/quiz-results/student/${studentId}`)).data;

export const getQuizResults = async (quizId) =>
  (await api.get(`/quiz-results/quiz/${quizId}`)).data;

export const getResultById = async (resultId) =>
  (await api.get(`/quiz-results/${resultId}`)).data;
