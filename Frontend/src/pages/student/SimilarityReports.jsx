import { useEffect, useState } from "react";
import { FileDown } from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import { EmptyState, ErrorBox } from "../../components/common/Feedback";
import { useAuth } from "../../context/AuthContext";
import { getMySimilarityReports, downloadSimilarityPdf } from "../../services/plagiarismService";
export default function SimilarityReports(){
 const {user}=useAuth();const id=user?.id;const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{if(id)getMySimilarityReports(id).then(setRows).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[id]);
 return <div className="space-y-5"><PageTitle title="My Similarity Reports" subtitle="View similarity comparisons involving your submitted assignments."/><ErrorBox>{error}</ErrorBox>
 {loading?<Loading/>:!rows.length?<div className="panel-card p-5"><EmptyState title="No reports available" message="Your reports will appear here when a comparison has been completed."/></div>:
 <div className="panel-card overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="p-4">Compared with</th><th className="p-4">Similarity</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody className="divide-y">{rows.map(r=><tr key={r.id}><td className="p-4">{r.studentAId===id?r.studentBName:r.studentAName}</td><td className="p-4 font-bold">{r.similarityPercent}%</td><td className="p-4">{r.status.replaceAll("_"," ")}</td><td className="p-4"><button className="btn-secondary" onClick={()=>downloadSimilarityPdf(r.id,id)}><FileDown size={15}/> Download report</button></td></tr>)}</tbody></table></div>}
 </div>;
}
