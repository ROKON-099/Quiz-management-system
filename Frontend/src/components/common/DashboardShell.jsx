import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Bell,
  ChartNoAxesCombined,
  ClipboardList,
  FileText,
  ScanSearch,
  NotebookPen,
  LayoutDashboard,
  LogOut,
  Menu,
  Trophy,
  X,
  Layers3,
  ChevronDown,
  UserRound,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { fullName, userId } from "../../utils/format";

const studentLinks = [
  ["Overview", "/student/dashboard", LayoutDashboard],
  ["My Courses", "/student/my-course", BookOpen],
  ["Course & Study Management", "/student/notice", Bell],
  ["Assignments", "/student/assignments", FileText],
  ["Similarity Reports", "/student/similarity-reports", ScanSearch],
  ["Leaderboard", "/leaderboard", Trophy],
];

const teacherLinks = [
  ["Overview", "/teacher/dashboard", LayoutDashboard],
  ["My Courses", "/teacher/my-course", BookOpen],
  ["Create Quiz", "/teacher/create-quiz", ClipboardList],
  ["Course & Study Management", "/teacher/notice", BookOpen],
  ["Assignments", "/teacher/assignments", FileText],
  ["Plagiarism Check", "/teacher/plagiarism", ScanSearch],
  ["Class Notes", "/teacher/class-notes", NotebookPen],
  ["Student Results", "/teacher/results", ChartNoAxesCombined],
];

export default function DashboardShell({ role }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("quizrank-sidebar-collapsed") === "true";
  });

  const profileRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = role === "TEACHER" ? teacherLinks : studentLinks;

  const name =
    fullName(user) || (role === "TEACHER" ? "Teacher" : "Student");

  const profilePath =
    role === "TEACHER" ? "/teacher/profile" : "/student/profile";

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem(
      "quizrank-sidebar-collapsed",
      String(collapsed)
    );
  }, [collapsed]);

  // Close profile dropdown on outside click or Escape
  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Logout
  function signOut() {
    setProfileOpen(false);
    setMobileOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  // Sidebar component
  function Sidebar({ isMobile = false }) {
    const isCollapsed = collapsed && !isMobile;

    return (
      <aside className="flex h-full flex-col overflow-hidden border-r border-slate-200 bg-white">

        {/* Logo */}
        <div
          className={`flex h-[78px] shrink-0 items-center border-b border-slate-100 ${
            isCollapsed
              ? "justify-center px-3"
              : "gap-3 px-5"
          }`}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-100">
            <Layers3 size={21} />
          </span>

          {!isCollapsed && (
            <div>
              <p className="text-[19px] font-extrabold tracking-tight text-slate-900">
                QuizRank<span className="text-emerald-600">.</span>
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">
                Academic workspace
              </p>
            </div>
          )}

          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              aria-label="Close sidebar"
            >
              <X size={19} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 pt-7">

          {!isCollapsed && (
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">
              Workspace
            </p>
          )}

          <nav className="space-y-1">
            {links.map(([label, to, Icon]) => (
              <NavLink
                key={to}
                to={to}
                title={isCollapsed ? label : undefined}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isCollapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
                  }`
                }
              >
                <Icon size={19} strokeWidth={1.9} />

                {!isCollapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="shrink-0 border-t border-slate-100 p-3">
          <button
            onClick={signOut}
            title={isCollapsed ? "Sign out" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
          >
            <LogOut size={18} />
            {!isCollapsed && "Sign out"}
          </button>

          {!isCollapsed && (
            <p className="mt-3 text-center text-[10px] text-slate-400">
              © {new Date().getFullYear()} QuizRank
            </p>
          )}
        </div>
      </aside>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* Desktop Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 hidden transition-all duration-300 lg:block ${
          collapsed ? "w-[78px]" : "w-[258px]"
        }`}
      >
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">

          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />

          <div className="relative h-full w-[280px] shadow-2xl">
            <Sidebar isMobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "lg:pl-[78px]" : "lg:pl-[258px]"
        }`}
      >

        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-[78px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl sm:px-7">

          {/* Navbar Left */}
          <div className="flex min-w-0 items-center gap-3">

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-emerald-50 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={19} />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setCollapsed((prev) => !prev)}
              className="hidden rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 lg:block"
              aria-label="Collapse or expand sidebar"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen size={19} />
              ) : (
                <PanelLeftClose size={19} />
              )}
            </button>

            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800">
                {role === "TEACHER"
                  ? "Teacher workspace"
                  : "Student workspace"}
              </p>

              <p className="mt-0.5 hidden truncate text-xs text-slate-400 sm:block">
                Department of Computer Science & Engineering
              </p>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative ml-3" ref={profileRef}>

            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-emerald-50 sm:gap-3 sm:px-2"
            >

              {/* User Name */}
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-slate-800">
                  {name}
                </p>

                <p className="text-xs text-slate-400">
                  {role === "TEACHER"
                    ? "Faculty account"
                    : "Student account"}
                </p>
              </div>

              {/* Avatar */}
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-white bg-emerald-100 font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-200">
                {name.slice(0, 1).toUpperCase()}
              </div>

              {/* Dropdown Arrow */}
              <ChevronDown
                size={17}
                className={`hidden text-slate-400 transition-transform duration-200 sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Content */}
            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60">

                <div className="border-b border-slate-100 bg-emerald-50 p-4">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {userId(user)} · {role}
                  </p>
                </div>

                <div className="p-2">

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate(profilePath);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <UserRound size={18} />
                    My Profile
                  </button>

                  <button
                    onClick={signOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut size={18} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-7 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-6 pb-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} QuizRank. Built for better learning.
        </footer>
      </div>
    </div>
  );
}