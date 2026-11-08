import { useMemo } from "react";
import { BookOpen, Bell, ClipboardCheck, Trophy, ArrowUpRight, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loading from "../../components/common/Loading";
import { EmptyState, ErrorBox } from "../../components/common/Feedback";
import useAsync from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";
import { getStudentCourses } from "../../services/courseService";
import { getNotices } from "../../services/noticeService";
import { getQuizzes } from "../../services/quizService";
import { fullName } from "../../utils/format";

export default function Dashboard(){
 const {user}=useAuth(); const id=user?.id||user?.userId;
 const courses=useAsync(()=>getStudentCourses(id),[id]);
 const notices=useAsync(getNotices,[]);
 const quizzes=useAsync(getQuizzes,[]);
 const upcoming=useMemo(()=>Array.isArray(quizzes.data)?quizzes.data.slice(0,5):[],[quizzes.data]);
 const subjectCount=Array.isArray(courses.data)?courses.data.length:0;
 return <><PageTitle title={`Welcome, ${fullName(user)}`} subtitle="Here is your learning overview."/>
  <ErrorBox>{courses.error||quizzes.error||notices.error}</ErrorBox>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="My Courses" value={courses.loading?"…":subjectCount} icon={BookOpen}/><StatCard label="Available Quizzes" value={quizzes.loading?"…":(quizzes.data||[]).length} icon={ClipboardCheck} tone="violet"/><StatCard label="Notices" value={notices.loading?"…":(notices.data||[]).length} icon={Bell} tone="amber"/><StatCard label="Leaderboard" value="View ranking" hint="See department performance" icon={Trophy} tone="emerald"/></div>
  <div className="mt-7 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
   <section className="panel-card"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-semibold text-slate-900">Available Quizzes</h2><p className="mt-1 text-xs text-slate-500">Quizzes published by your teachers</p></div><Link to="/student/my-course" className="text-sm font-semibold text-indigo-600">My courses <ArrowUpRight size={15} className="inline"/></Link></div>
    {quizzes.loading?<Loading/>:upcoming.length===0?<EmptyState title="No quizzes available" message="New quizzes will appear here when published."/>:<div className="divide-y divide-slate-100">{upcoming.map(q=><div key={q.id} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"><div><p className="font-semibold text-slate-800">{q.title||q.topic||"Course Quiz"}</p><p className="mt-1 text-xs text-slate-500">{q.subject?.name||q.subjectName||"Course"} · {q.totalQuestions||10} questions</p></div><Link to={`/student/quiz/${q.id}`} className="btn-primary btn-sm">Start quiz</Link></div>)}</div>}
   </section>
   <section className="panel-card"><div className="border-b border-slate-100 p-5"><h2 className="font-semibold text-slate-900">Latest Notices</h2><p className="mt-1 text-xs text-slate-500">Updates from your teachers</p></div>
    {notices.loading?<Loading/>:!notices.data?.length?<EmptyState title="No notices yet"/>:<div className="divide-y divide-slate-100">{notices.data.slice(0,4).map(n=><div className="p-4" key={n.id}><p className="font-semibold text-slate-800">{n.topic||n.title}</p><p className="mt-1 line-clamp-2 text-sm text-slate-500">{n.message}</p><p className="mt-2 flex items-center gap-1 text-xs text-slate-400"><Clock3 size={13}/>{n.createdAt?new Date(n.createdAt).toLocaleDateString():"Notice"}</p></div>)}</div>}
   </section>
  </div>
 </>;
}
