import api from "./api";
export const loginRequest = async (userId, password) =>
  (await api.post("/auth/login", { userId, password })).data;
