import { BookOpen, GraduationCap, ClipboardList } from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import { EmptyState, ErrorBox } from "../../components/common/Feedback";
import useAsync from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";
import { getStudentCourses } from "../../services/courseService";
import { getQuizzes } from "../../services/quizService";

export default function MyCourse(){
 const {user}=useAuth(); const id=user?.id||user?.userId;
 const {data,loading,error}=useAsync(()=>getStudentCourses(id),[id]);
 const quizState=useAsync(getQuizzes,[]);
 const courses=(data||[]).map(x=>x.subject||x).filter(Boolean);
 return <><PageTitle title="My Courses" subtitle="Courses assigned to your batch and your quiz activity."/><ErrorBox>{error||quizState.error}</ErrorBox>
 {loading?<Loading text="Loading your courses..."/>:courses.length===0?<div className="panel-card"><EmptyState title="No courses found" message="Your assigned courses will appear here."/></div>:<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{courses.map((c,i)=>{const quizzes=(quizState.data||[]).filter(q=>q.subjectId===c.id);return <article key={c.id||i} className="panel-card p-6 transition hover:-translate-y-1 hover:shadow-lg"><div className="mb-5 flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><BookOpen size={23}/></span><span className="badge-indigo">{c.courseCode||c.code||"COURSE"}</span></div><h2 className="text-lg font-bold text-slate-900">{c.name||c.subjectName||"Course"}</h2><p className="mt-1 text-sm text-slate-500">{c.teacherName||"Department course"}</p><div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4"><div><p className="text-xs text-slate-400">Total quizzes</p><p className="mt-1 flex items-center gap-2 font-semibold text-slate-800"><ClipboardList size={16} className="text-indigo-500"/>{quizzes.length}</p></div><div><p className="text-xs text-slate-400">Credits</p><p className="mt-1 flex items-center gap-2 font-semibold text-slate-800"><GraduationCap size={16} className="text-indigo-500"/>{c.credit??"—"}</p></div></div></article>})}</div>}
 </>;
}
