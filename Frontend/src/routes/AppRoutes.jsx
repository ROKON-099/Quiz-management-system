import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/common/ProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";
import TeacherLayout from "../layouts/TeacherLayout";
import LeaderboardLayout from "../layouts/LeaderboardLayout";

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
import StudentAssignments from "../pages/student/Assignments";
import StudentSimilarityReports from "../pages/student/SimilarityReports";
import StudentClassNotes from "../pages/student/ClassNotes";

// Teacher Pages
import TeacherDashboard from "../pages/teacher/Dashboard";
import TeacherCourses from "../pages/teacher/MyCourse";
import TeacherNotice from "../pages/teacher/Notice";
import TeacherProfile from "../pages/teacher/Profile";
import CreateQuiz from "../pages/teacher/CreateQuiz";
import TeacherResults from "../pages/teacher/Results";
import TeacherAssignments from "../pages/teacher/Assignments";
import TeacherPlagiarism from "../pages/teacher/Plagiarism";
import TeacherClassNotes from "../pages/teacher/ClassMaterials";

export default function AppRoutes() {
  return (
    <Routes>

      {/* ================= AUTHENTICATION ================= */}

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>


      {/* ================= SHARED PROTECTED ROUTES ================= */}

      <Route element={<ProtectedRoute />}>
        <Route path="/leaderboard" element={<LeaderboardLayout />}>
          <Route index element={<Leaderboard />} />
        </Route>
      </Route>


      {/* ================= STUDENT ROUTES ================= */}

      <Route element={<ProtectedRoute role="STUDENT" />}>
        <Route path="/student" element={<StudentLayout />}>

          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<StudentDashboard />}
          />

          <Route
            path="my-course"
            element={<StudentCourses />}
          />

          <Route
            path="notice"
            element={<StudentNotice />}
          />

          <Route
            path="assignments"
            element={<StudentAssignments />}
          />

          <Route
            path="similarity-reports"
            element={<StudentSimilarityReports />}
          />

          <Route
            path="class-notes"
            element={<StudentClassNotes />}
          />

          <Route
            path="profile"
            element={<StudentProfile />}
          />

          <Route
            path="quiz/:id"
            element={<StudentQuiz />}
          />

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

          <Route
            path="dashboard"
            element={<TeacherDashboard />}
          />

          <Route
            path="my-course"
            element={<TeacherCourses />}
          />

          <Route
            path="notice"
            element={<TeacherNotice />}
          />

          <Route
            path="assignments"
            element={<TeacherAssignments />}
          />

          <Route
            path="plagiarism"
            element={<TeacherPlagiarism />}
          />

          <Route
            path="class-notes"
            element={<TeacherClassNotes />}
          />

          <Route
            path="create-quiz"
            element={<CreateQuiz />}
          />

          <Route
            path="results"
            element={<TeacherResults />}
          />

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


// ================= HOME REDIRECT =================

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