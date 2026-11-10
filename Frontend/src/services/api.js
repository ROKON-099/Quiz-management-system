import axios from "axios";

const api = axios.create({
  baseURL: "https://quiz-management-system-2qpj.onrender.com/api",
});

export default api;