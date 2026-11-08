import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";
import TeacherLayout from "../layouts/TeacherLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Leaderboard from "../pages/common/Leaderboard";
import StudentDashboard from "../pages/student/Dashboard";
import StudentCourses from "../pages/student/MyCourse";
import StudentNotice from "../pages/student/Notice";
import StudentProfile from "../pages/student/Profile";
import StudentQuiz from "../pages/student/Quiz";
import StudentResult from "../pages/student/Result";
import TeacherDashboard from "../pages/teacher/Dashboard";
import TeacherCourses from "../pages/teacher/MyCourse";
import TeacherNotice from "../pages/teacher/Notice";
import TeacherProfile from "../pages/teacher/Profile";
import CreateQuiz from "../pages/teacher/CreateQuiz";
import TeacherResults from "../pages/teacher/Results";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Route>
      <Route element={<ProtectedRoute role="STUDENT" />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="my-course" element={<StudentCourses />} />
          <Route path="notice" element={<StudentNotice />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="quiz/:id" element={<StudentQuiz />} />
          <Route path="result/:id" element={<StudentResult />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute role="TEACHER" />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="my-course" element={<TeacherCourses />} />
          <Route path="notice" element={<TeacherNotice />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="create-quiz" element={<CreateQuiz />} />
          <Route path="results" element={<TeacherResults />} />
        </Route>
      </Route>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
function HomeRedirect() {
  const raw = localStorage.getItem("quizrank_user");
  let user = null;
  try {
    user = JSON.parse(raw || "null");
  } catch {}
  return (
    <Navigate
      to={
        user?.role === "TEACHER"
          ? "/teacher/dashboard"
          : user?.role === "STUDENT"
            ? "/student/dashboard"
            : "/login"
      }
      replace
    />
  );
}
