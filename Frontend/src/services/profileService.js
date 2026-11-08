import api from "./api";
export const getAcademicRecordsPlaceholder = async (studentId) =>
  (await api.get(`/academic-records/student/${studentId}`)).data;
