import api from "./api";
export const getDepartmentLeaderboard = async () =>
  (await api.get("/leaderboard/department")).data;
export const getBatchLeaderboard = async (batch) =>
  (await api.get(`/leaderboard/batch/${encodeURIComponent(batch)}`)).data;
