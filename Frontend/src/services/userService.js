import api from "./api";
export const getUser = async (id) => (await api.get(`/users/${id}`)).data;
export const getStudents = async () => (await api.get("/users/students")).data;
export const getTeachers = async () => (await api.get("/users/teachers")).data;
