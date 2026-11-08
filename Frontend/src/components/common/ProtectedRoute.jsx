import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
export default function ProtectedRoute({ role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard"} replace />;
  return <Outlet />;
}
