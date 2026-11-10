import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import StudentLayout from "./StudentLayout";
import TeacherLayout from "./TeacherLayout";

export default function LeaderboardLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "STUDENT") {
    return <StudentLayout />;
  }

  if (user.role === "TEACHER") {
    return <TeacherLayout />;
  }

  return <Navigate to="/login" replace />;
}