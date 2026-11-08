import { useMemo, useState } from "react";
import { Award, Medal, Trophy, Users, ClipboardList, Search } from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loading from "../../components/common/Loading";
import { EmptyState, ErrorBox } from "../../components/common/Feedback";
import useAsync from "../../hooks/useAsync";
import { getDepartmentLeaderboard } from "../../services/leaderboardService";
import { number } from "../../utils/format";

export default function Leaderboard(){
  const {data,loading,error}=useAsync(getDepartmentLeaderboard,[]);
  const [query,setQuery]=useState("");
  const rows=useMemo(()=> (Array.isArray(data)?data:[]).filter(x=>`${x.name||""} ${x.userId||""} ${x.batch||""}`.toLowerCase().includes(query.toLowerCase())),[data,query]);
  const top=rows[0];
  return <><PageTitle title="Leaderboard" subtitle="Overall student academic performance ranking."/><ErrorBox>{error}</ErrorBox>
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><StatCard label="Ranked Students" value={data?.length??"—"} icon={Users}/><StatCard label="Top CGPA" value={top?number(top.cgpa):"—"} icon={Trophy} tone="amber"/><StatCard label="Top Student" value={top?.name||"—"} hint={top?.userId||""} icon={Award} tone="violet"/></div>
    <section className="panel-card overflow-hidden"><div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-slate-900">Department Ranking</h2><p className="mt-1 text-xs text-slate-500">Sorted by current CGPA</p></div><div className="input-icon-wrap w-full sm:max-w-xs"><Search size={17}/><input className="field-input" placeholder="Search student or batch..." value={query} onChange={e=>setQuery(e.target.value)}/></div></div>
      {loading?<Loading text="Loading leaderboard..."/>:rows.length===0?<EmptyState title="No ranking found" message="There are no current academic records matching this search."/>:<div className="overflow-x-auto"><table className="data-table min-w-[720px]"><thead><tr><th>Rank</th><th>Student</th><th>Student ID</th><th>Batch</th><th>CGPA</th><th>Department Rank</th><th>Batch Rank</th></tr></thead><tbody>{rows.map((r,i)=><tr key={`${r.studentId}-${i}`}><td><span className={`inline-grid h-8 w-8 place-items-center rounded-lg font-bold ${i===0?"bg-amber-100 text-amber-700":i===1?"bg-slate-100 text-slate-600":i===2?"bg-orange-100 text-orange-700":"text-slate-500"}`}>{i+1}</span></td><td className="font-semibold text-slate-800">{r.name||"—"}</td><td>{r.userId||r.studentId}</td><td><span className="badge-indigo">{r.batch||"—"}</span></td><td className="font-bold text-indigo-700">{number(r.cgpa)}</td><td>{r.departmentRank??"—"}</td><td>{r.batchRank??"—"}</td></tr>)}</tbody></table></div>}
    </section>
  </>;
}
