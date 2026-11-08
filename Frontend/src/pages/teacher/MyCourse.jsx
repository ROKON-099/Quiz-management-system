import { BookOpen, Plus, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import { EmptyState, ErrorBox } from "../../components/common/Feedback";
import useAsync from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";
import { getTeacherCourses } from "../../services/courseService";
import { getQuizzes } from "../../services/quizService";

export default function MyCourse(){const {user}=useAuth();const id=user?.id||user?.userId;const {data,loading,error}=useAsync(()=>getTeacherCourses(id),[id]);const quizState=useAsync(getQuizzes,[]);return <><PageTitle title="My Courses" subtitle="Courses assigned to you." action={<Link to="/teacher/create-quiz" className="btn-primary"><Plus size={17}/> Create Quiz</Link>}/><ErrorBox>{error||quizState.error}</ErrorBox>{loading?<Loading/>:!data?.length?<div className="panel-card"><EmptyState title="No courses assigned"/></div>:<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{data.map(c=>{const count=(quizState.data||[]).filter(q=>q.subjectId===c.id).length;return <article className="panel-card p-6" key={c.id}><div className="mb-5 flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><BookOpen size={23}/></span><span className="badge-indigo">{c.courseCode||c.code||"COURSE"}</span></div><h2 className="text-lg font-bold text-slate-900">{c.name||c.subjectName}</h2><p className="mt-1 text-sm text-slate-500">{c.batch||"Assigned course"}</p><div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4"><span className="flex items-center gap-2 text-sm text-slate-500"><ClipboardList size={16}/>{count} quizzes</span><Link to="/teacher/create-quiz" className="text-sm font-semibold text-indigo-600">Create quiz <Plus size={15} className="inline"/></Link></div></article>})}</div>}</>}
