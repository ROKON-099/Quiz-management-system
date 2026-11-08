import api from "./api";
export const getNotices = async () => (await api.get("/notices")).data;
export const getTeacherNotices = async (teacherId) =>
  (await api.get(`/notices/teacher/${teacherId}`)).data;
export const createNotice = async (payload) => (await api.post("/notices", payload)).data;
export const updateNotice = async (id, payload) => (await api.put(`/notices/${id}`, payload)).data;
export const deleteNotice = async (id) => (await api.delete(`/notices/${id}`)).data;
