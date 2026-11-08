import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, BookOpen, Eye, EyeOff, LoaderCircle, LockKeyhole, LogIn, Trophy, UserRound } from "lucide-react";
import Brand from "../../components/common/Brand";
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
    e.preventDefault(); setError("");
    try {
      const user = await login(userId.trim(), password);
      if (user.role === "STUDENT") navigate("/student/dashboard", { replace: true });
      else if (user.role === "TEACHER") navigate("/teacher/dashboard", { replace: true });
      else setError("Unknown account role. Please contact your department.");
    } catch (err) { setError(err.message || "Invalid ID or password."); }
  }

  return <main className="flex min-h-screen items-center justify-center px-4 py-8">
    <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-indigo-100 md:grid-cols-2">
      <section className="relative hidden min-h-[650px] overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-10 text-white md:flex md:flex-col md:justify-between">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5"/><div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-violet-300/10"/>
        <div className="relative"><Brand light/></div>
        <div className="relative"><p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-100"><Activity size={14}/> Learn. Practice. Compete.</p><h1 className="max-w-md text-4xl font-extrabold leading-tight">Test your knowledge.<br/>Track your progress.</h1><p className="mt-5 max-w-sm leading-7 text-indigo-100">Practice with course quizzes, compete with your classmates and follow your academic journey.</p></div>
        <div className="relative flex flex-wrap gap-6 text-sm text-indigo-100"><span className="flex items-center gap-2"><BookOpen size={17}/> Courses</span><span className="flex items-center gap-2"><Trophy size={17}/> Leaderboard</span><span className="flex items-center gap-2"><Activity size={17}/> Progress</span></div>
      </section>
      <section className="p-7 sm:p-10 md:p-12">
        <div className="mb-10 md:hidden"><Brand/></div>
        <div className="mb-8"><p className="text-sm font-semibold text-indigo-600">WELCOME BACK</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Sign in to QuizRank</h2><p className="mt-2 text-sm text-slate-500">Enter your student or teacher credentials.</p></div>
        <ErrorBox>{error}</ErrorBox>
        <form onSubmit={submit} className="space-y-5">
          <div><label className="field-label" htmlFor="userId">Student / Teacher ID</label><div className="input-icon-wrap"><UserRound size={19}/><input id="userId" className="field-input" value={userId} onChange={e=>setUserId(e.target.value)} placeholder="Enter your ID" autoComplete="username" required/></div></div>
          <div><label className="field-label" htmlFor="password">Password</label><div className="input-icon-wrap"><LockKeyhole size={19}/><input id="password" className="field-input pr-12" type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required/><button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-4 text-slate-400 hover:text-slate-700" aria-label="Toggle password">{showPassword?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></div>
          <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"/>Remember me</label>
          <button disabled={loading} className="btn-primary w-full py-3.5">{loading?<LoaderCircle className="animate-spin" size={19}/>:<LogIn size={19}/>} {loading?"Signing in...":"Login"}</button>
        </form>
        <div className="my-7 flex items-center gap-4"><span className="h-px flex-1 bg-slate-200"/><span className="text-xs text-slate-400">NEW TO QUIZRANK?</span><span className="h-px flex-1 bg-slate-200"/></div>
        <Link to="/register" className="btn-secondary w-full py-3">Create an account</Link>
        <p className="mt-8 text-center text-xs text-slate-400">© {new Date().getFullYear()} QuizRank · Department Quiz Platform</p>
      </section>
    </div>
  </main>;
}
