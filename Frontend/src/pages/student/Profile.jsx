import { Award, BookOpen, GraduationCap, Mail, UserRound } from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loading from "../../components/common/Loading";
import { ErrorBox } from "../../components/common/Feedback";
import useAsync from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";
import { getAcademicRecordsPlaceholder } from "../../services/profileService";
import { fullName, userId, number } from "../../utils/format";

export default function Profile(){
 const {user}=useAuth(); const id=user?.id||user?.userId;
 const {data,loading,error}=useAsync(()=>getAcademicRecordsPlaceholder(id),[id]);
 const current=(data||[]).find(x=>String(x.semester).toLowerCase()==="current")||(data||[])[0];
 return <><PageTitle title="My Profile" subtitle="Your personal and academic information."/><ErrorBox>{error}</ErrorBox>
 <div className="panel-card overflow-hidden"><div className="h-32 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500"/><div className="px-6 pb-7"><div className="-mt-12 mb-5 grid h-24 w-24 place-items-center rounded-3xl border-4 border-white bg-indigo-100 text-indigo-700 shadow-sm"><UserRound size={42}/></div><h2 className="text-2xl font-bold text-slate-900">{fullName(user)}</h2><p className="mt-1 text-sm text-slate-500">{userId(user)} · Student</p><div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[["Student ID",userId(user),GraduationCap],["Department",user?.department||"—",BookOpen],["Batch",user?.batch||"—",Award],["Email",user?.email||"—",Mail],["Account Role",user?.role||"STUDENT",UserRound]].map(([label,value,Icon])=><div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-indigo-600"><Icon size={18}/></span><div><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div></div>)}</div></div></div>
 <div className="mt-6 grid gap-4 sm:grid-cols-3">{loading?<div className="sm:col-span-3"><Loading/></div>:<><StatCard label="Current CGPA" value={current?number(current.cgpa):"—"} icon={GraduationCap}/><StatCard label="Batch Rank" value={current?.batchRank??"—"} icon={Award} tone="amber"/><StatCard label="Department Rank" value={current?.departmentRank??"—"} icon={TrophyIcon} tone="violet"/></>}</div>
 </>;
}
function TrophyIcon(props){return <Award {...props}/>}
