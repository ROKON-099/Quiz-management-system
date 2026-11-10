import { useEffect, useState } from "react";
import { Search, RefreshCw, FileDown, ScanSearch } from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import { ErrorBox, EmptyState } from "../../components/common/Feedback";
import { useAuth } from "../../context/AuthContext";
import { getAssignments, getAssignmentSubmissions } from "../../services/learningService";
import { getSimilarityReports, getPlagiarismStats, compareSubmissions, recheckSubmission, downloadSimilarityPdf } from "../../services/plagiarismService";

const badge = s => s === "HIGH_SIMILARITY" ? "bg-rose-100 text-rose-700" : s === "NEEDS_REVIEW" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
export default function Plagiarism() {
 const { user } = useAuth(); const teacherId = user?.id;
 const [assignments,setAssignments]=useState([]),[assignmentId,setAssignmentId]=useState("");
 const [reports,setReports]=useState([]),[submissions,setSubmissions]=useState([]);
 const [stats,setStats]=useState({total:0,highSimilarity:0,needsReview:0,lowSimilarity:0});
 const [a,setA]=useState(""),[b,setB]=useState(""),[query,setQuery]=useState(""),[status,setStatus]=useState("");
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[expanded,setExpanded]=useState(null);
 useEffect(()=>{ if(teacherId) getAssignments("TEACHER",teacherId).then(data=>{setAssignments(data); if(data.length)setAssignmentId(String(data[0].id));}).catch(e=>setError(e.message));},[teacherId]);
 async function load(id=assignmentId){ if(!id)return;setBusy(true);setError("");try{
  const [r,s,subs]=await Promise.all([getSimilarityReports(id,teacherId),getPlagiarismStats(id,teacherId),getAssignmentSubmissions(id,teacherId)]);
  setReports(r);setStats(s);setSubmissions(subs);
 }catch(e){setError(e.message);}finally{setBusy(false);}}
 useEffect(()=>{if(assignmentId)load(assignmentId);},[assignmentId]);
 async function manualCompare(){if(!a||!b||a===b){setError("Select two different submissions.");return;}setBusy(true);setError("");try{await compareSubmissions({submissionAId:Number(a),submissionBId:Number(b),teacherId});await load();}catch(e){setError(e.message);}finally{setBusy(false);}}
 async function recheck(id){setBusy(true);try{await recheckSubmission(id,teacherId);setError("Recheck queued. Refresh in a moment to view the result.");}catch(e){setError(e.message);}finally{setBusy(false);}}
 const filtered=reports.filter(r=>(!status||r.status===status)&&(!query||`${r.studentAName} ${r.studentBName} ${r.studentAUserId} ${r.studentBUserId}`.toLowerCase().includes(query.toLowerCase())));
 return <div className="space-y-6">
  <PageTitle title="Plagiarism & Similarity" subtitle="Compare submitted PDFs within each assignment. Similarity is an indicator for teacher review, not proof of misconduct."/>
  <ErrorBox>{error}</ErrorBox>
  <section className="panel-card p-5">
   <label className="field-label">Select assignment</label>
   <select className="field-input standalone max-w-xl" value={assignmentId} onChange={e=>setAssignmentId(e.target.value)}>
    {assignments.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}
   </select>
   <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {[["Total comparisons",stats.total],["High similarity",stats.highSimilarity],["Needs review",stats.needsReview],["Low similarity",stats.lowSimilarity]].map(([k,v])=><div className="rounded-xl bg-slate-50 p-4" key={k}><p className="text-sm text-slate-500">{k}</p><p className="mt-1 text-2xl font-bold text-slate-900">{v}</p></div>)}
   </div>
  </section>
  <section className="panel-card p-5">
   <h2 className="mb-3 font-bold">Manual comparison</h2>
   <div className="grid gap-3 md:grid-cols-3">
    {[["Submission A",a,setA],["Submission B",b,setB]].map(([label,value,set])=><label className="text-sm font-medium text-slate-600" key={label}>{label}<select className="field-input standalone mt-1" value={value} onChange={e=>set(e.target.value)}><option value="">Select submission</option>{submissions.map(x=><option key={x.submissionId} value={x.submissionId}>{x.studentName} · {x.userId} · #{x.submissionId}</option>)}</select></label>)}
    <button className="btn-primary self-end" disabled={busy} onClick={manualCompare}><ScanSearch size={16}/> Compare PDFs</button>
   </div>
  </section>
  <section className="panel-card overflow-hidden">
   <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
    <h2 className="font-bold">Similarity reports</h2>
    <div className="flex flex-wrap gap-2">
     <input className="field-input standalone" placeholder="Search student..." value={query} onChange={e=>setQuery(e.target.value)}/>
     <select className="field-input standalone" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option><option value="HIGH_SIMILARITY">High similarity</option><option value="NEEDS_REVIEW">Needs review</option><option value="LOW_SIMILARITY">Low similarity</option></select>
     <button className="btn-secondary" onClick={()=>load()}><RefreshCw size={15}/> Refresh</button>
    </div>
   </div>
   {busy?<div className="p-5"><Loading/></div>:!filtered.length?<div className="p-5"><EmptyState title="No similarity reports yet" message="Reports are generated automatically after students submit PDFs, or use manual comparison above."/></div>:
    <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Students</th><th className="px-4 py-3">Similarity</th><th className="px-4 py-3">Cosine / Jaccard / N-gram</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Matched phrases</th><th className="px-4 py-3">Details</th></tr></thead><tbody className="divide-y">{filtered.map(r=><><tr key={r.id}><td className="px-4 py-3"><b>{r.studentAName}</b> vs <b>{r.studentBName}</b><p className="text-xs text-slate-400">{r.studentAUserId} / {r.studentBUserId}</p></td><td className="px-4 py-3 font-bold">{r.similarityPercent}%</td><td className="px-4 py-3">{r.cosinePercent}% / {r.jaccardPercent}% / {r.ngramPercent}%</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${badge(r.status)}`}>{r.status.replaceAll("_"," ")}</span></td><td className="px-4 py-3">{r.matchedCount}</td><td className="px-4 py-3 flex gap-2"><button className="btn-secondary" onClick={()=>setExpanded(expanded===r.id?null:r.id)}>View</button><button className="btn-secondary" onClick={()=>downloadSimilarityPdf(r.id,teacherId)}><FileDown size={14}/> PDF</button></td></tr>{expanded===r.id&&<tr><td colSpan="6" className="bg-slate-50 px-5 py-4"><p className="mb-2 font-semibold">Exact matching sentences ({r.matchedCount})</p><pre className="whitespace-pre-wrap text-sm text-slate-700">{r.matchedText||"No exact matching sentences were found. Similarity can still be based on token and phrase overlap."}</pre></td></tr></> )}</tbody></table></div>}
  </section>
 </div>;
}
