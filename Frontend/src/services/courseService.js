import api from "./api";
export const getStudentCourses = async (studentId) =>
  (await api.get(`/student-courses/student/${studentId}`)).data;
export const getTeacherCourses = async (teacherId) =>
  (await api.get(`/subjects/teacher/${teacherId}`)).data;
export const getBatchCourses = async (batch) =>
  (await api.get(`/subjects/batch/${encodeURIComponent(batch)}`)).data;
