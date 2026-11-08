import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/common/ProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";
import TeacherLayout from "../layouts/TeacherLayout";

// Authentication
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Common
import Leaderboard from "../pages/common/Leaderboard";

// Student Pages
import StudentDashboard from "../pages/student/Dashboard";
import StudentCourses from "../pages/student/MyCourse";
import StudentNotice from "../pages/student/Notice";
import StudentProfile from "../pages/student/Profile";
import StudentQuiz from "../pages/student/Quiz";
import StudentResult from "../pages/student/Result";

// Teacher Pages
import TeacherDashboard from "../pages/teacher/Dashboard";
import TeacherCourses from "../pages/teacher/MyCourse";
import TeacherNotice from "../pages/teacher/Notice";
import TeacherProfile from "../pages/teacher/Profile";
import CreateQuiz from "../pages/teacher/CreateQuiz";
import TeacherResults from "../pages/teacher/Results";

// Assignment Pages
import StudentAssignments from "../pages/student/Assignments";
import TeacherAssignments from "../pages/teacher/Assignments";

// Class Notes Pages
import StudentClassNotes from "../pages/student/ClassNotes";
import TeacherClassNotes from "../pages/teacher/ClassNotes";

export default function AppRoutes() {
  return (
    <Routes>

      {/* ================= AUTHENTICATION ================= */}

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>


      {/* ================= COMMON ROUTES ================= */}

      <Route element={<ProtectedRoute />}>
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Route>


      {/* ================= STUDENT ROUTES ================= */}

      <Route element={<ProtectedRoute role="STUDENT" />}>

        <Route path="/student" element={<StudentLayout />}>

          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          {/* Dashboard */}
          <Route
            path="dashboard"
            element={<StudentDashboard />}
          />

          {/* Courses */}
          <Route
            path="my-course"
            element={<StudentCourses />}
          />

          {/* Course & Study Management / Notices */}
          <Route
            path="notice"
            element={<StudentNotice />}
          />

          {/* Assignments */}
          <Route
            path="assignments"
            element={<StudentAssignments />}
          />

          {/* Class Notes */}
          <Route
            path="class-notes"
            element={<StudentClassNotes />}
          />

          {/* Profile */}
          <Route
            path="profile"
            element={<StudentProfile />}
          />

          {/* Quiz */}
          <Route
            path="quiz/:id"
            element={<StudentQuiz />}
          />

          {/* Quiz Result */}
          <Route
            path="result/:id"
            element={<StudentResult />}
          />

        </Route>
      </Route>


      {/* ================= TEACHER ROUTES ================= */}

      <Route element={<ProtectedRoute role="TEACHER" />}>

        <Route path="/teacher" element={<TeacherLayout />}>

          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          {/* Dashboard */}
          <Route
            path="dashboard"
            element={<TeacherDashboard />}
          />

          {/* Courses */}
          <Route
            path="my-course"
            element={<TeacherCourses />}
          />

          {/* Course & Study Management */}
          <Route
            path="notice"
            element={<TeacherNotice />}
          />

          {/* Assignment Management */}
          <Route
            path="assignments"
            element={<TeacherAssignments />}
          />

          {/* Class Notes Upload */}
          <Route
            path="class-notes"
            element={<TeacherClassNotes />}
          />

          {/* Create Quiz */}
          <Route
            path="create-quiz"
            element={<CreateQuiz />}
          />

          {/* Student Results */}
          <Route
            path="results"
            element={<TeacherResults />}
          />

          {/* Profile */}
          <Route
            path="profile"
            element={<TeacherProfile />}
          />

        </Route>
      </Route>


      {/* ================= HOME REDIRECT ================= */}

      <Route
        path="/"
        element={<HomeRedirect />}
      />

      {/* ================= NOT FOUND ================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}


function HomeRedirect() {
  const raw = localStorage.getItem("quizrank_user");

  let user = null;

  try {
    user = JSON.parse(raw || "null");
  } catch {
    user = null;
  }

  if (user?.role === "TEACHER") {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  if (user?.role === "STUDENT") {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}