import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  UserRound,
} from "lucide-react";

import quizRankLogo from "../../assets/Logo.png";
import { useAuth } from "../../context/AuthContext";
import { ErrorBox } from "../../components/common/Feedback";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      const user = await login(userId.trim(), password);

      if (user.role === "STUDENT") {
        navigate("/student/dashboard", { replace: true });
      } else if (user.role === "TEACHER") {
        navigate("/teacher/dashboard", { replace: true });
      } else {
        setError(
          "Unknown account role. Please contact your department."
        );
      }
    } catch (err) {
      setError(err.message || "Invalid ID or password.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-4 py-8 sm:px-6">

      {/* Login Container */}
      <div className="w-full max-w-[550px] rounded-2xl border border-slate-100 bg-white px-6 py-8 shadow-[0_15px_60px_rgba(37,48,89,0.08)] sm:px-10 sm:py-10 md:px-12">

        {/* QuizRank Logo */}
        <div className="mb-6 flex justify-center">
          <img
            src={quizRankLogo}
            alt="QuizRank Logo"
            className="h-20 w-20 object-contain sm:h-24 sm:w-24"
          />
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-wide text-[#059669]">
            WELCOME BACK
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Sign in to QuizRank
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Enter your student or teacher credentials.
          </p>
        </div>

        {/* Error Message */}
        <ErrorBox>{error}</ErrorBox>

        {/* Login Form */}
        <form onSubmit={submit} className="space-y-5">

          {/* User ID */}
          <div>
            <label
              className="field-label"
              htmlFor="userId"
            >
              Student / Teacher ID
            </label>

            <div className="input-icon-wrap">
              <UserRound size={19} />

              <input
                id="userId"
                className="field-input"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your ID"
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              className="field-label"
              htmlFor="password"
            >
              Password
            </label>

            <div className="input-icon-wrap">
              <LockKeyhole size={19} />

              <input
                id="password"
                className="field-input pr-12"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 text-slate-400 transition hover:text-slate-700"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-emerald-600 focus:ring-emerald-500"
            />

            Remember me
          </label>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <LoaderCircle
                className="animate-spin"
                size={19}
              />
            ) : (
              <LogIn size={19} />
            )}

            {loading ? "Signing in..." : "Login"}
          </button>

        </form>

        {/* Footer */}
        <p className="mt-10 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} QuizRank ·Developed by 3DEV. All rights reserved.
        </p>

      </div>
    </main>
  );
}