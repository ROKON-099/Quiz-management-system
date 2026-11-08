import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Bell,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Trophy,
  UserRound,
  X,
  Layers3,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fullName, userId } from "../../utils/format";

const studentLinks = [
  ["Dashboard", "/student/dashboard", LayoutDashboard],
  ["My Course", "/student/my-course", BookOpen],
  ["Notice", "/student/notice", Bell],
  ["Leaderboard", "/leaderboard", Trophy],
  ["My Profile", "/student/profile", UserRound],
];
const teacherLinks = [
  ["Dashboard", "/teacher/dashboard", LayoutDashboard],
  ["My Course", "/teacher/my-course", BookOpen],
  ["Create Quiz", "/teacher/create-quiz", ClipboardList],
  ["Notice Management", "/teacher/notice", Bell],
  ["Student Results", "/teacher/results", ChartNoAxesCombined],
  ["My Profile", "/teacher/profile", UserRound],
];

export default function DashboardShell({ role }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = role === "TEACHER" ? teacherLinks : studentLinks;
  const signOut = () => {
    logout();
    navigate("/login");
  };
  const sidebar = (
    <aside className="flex h-full flex-col bg-slate-950 text-slate-300">
      <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500 text-white">
          <Layers3 size={21} />
        </span>
        <div>
          <p className="text-lg font-bold text-white">QuizRank</p>
          <p className="text-[10px] text-slate-400">DEPARTMENT PLATFORM</p>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto rounded-lg p-2 text-slate-400 lg:hidden"
        >
          <X size={19} />
        </button>
      </div>
      <div className="px-4 pt-6">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">
          Workspace
        </p>
        <nav className="space-y-1">
          {links.map(([label, to, Icon]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "Notice" && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-200">
            {fullName(user).slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {fullName(user)}
            </p>
            <p className="truncate text-xs text-slate-400">{userId(user)}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="nav-link w-full text-rose-300 hover:bg-rose-500/10"
        >
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </aside>
  );
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="fixed inset-y-0 left-0 z-30 hidden w-[258px] lg:block">
        {sidebar}
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-[280px] shadow-2xl">{sidebar}</div>
        </div>
      )}
      <div className="min-h-screen lg:pl-[258px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden"
            >
              <Menu size={19} />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {role === "TEACHER" ? "Teacher Workspace" : "Student Workspace"}
              </p>
              <p className="text-xs text-slate-400">Department Quiz Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-semibold text-slate-800">
                {fullName(user)}
              </span>
              <span className="block text-xs text-slate-400">{role}</span>
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700">
              {fullName(user).slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-7 lg:p-8">
          <Outlet />
        </main>
        <footer className="px-6 pb-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} QuizRank. Department Quiz Platform.
        </footer>
      </div>
    </div>
  );
}
