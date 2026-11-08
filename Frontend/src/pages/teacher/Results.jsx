import { useMemo, useState } from "react";
import { Award, Search, Users, ClipboardCheck, TrendingUp, Download, FileText } from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loading from "../../components/common/Loading";
import { EmptyState, ErrorBox } from "../../components/common/Feedback";
import useAsync from "../../hooks/useAsync";
import { getQuizzes } from "../../services/quizService";
import { getQuizResults } from "../../services/resultService";
import { useAuth } from "../../context/AuthContext";
import { number } from "../../utils/format";

const dateText = (value) => value ? new Date(value).toLocaleString() : "—";

export default function Results() {
  const { user } = useAuth();
  const id = user?.id || user?.userId;
  const { data: quizzes, loading, error } = useAsync(getQuizzes, []);
  const [quizId, setQuizId] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [query, setQuery] = useState("");
  const mine = (quizzes || []).filter(q => Number(q.createdBy ?? q.teacherId) === Number(id));
  const selectedQuiz = mine.find(q => String(q.id) === String(quizId));

  async function load(value) {
    setQuizId(value); setFailure("");
    if (!value) { setResults([]); return; }
    setBusy(true);
    try { setResults(await getQuizResults(value)); }
    catch (e) { setFailure(e.message); setResults([]); }
    finally { setBusy(false); }
  }

  const sorted = useMemo(() => [...results].sort((a, b) =>
    Number(b.score || 0) - Number(a.score || 0) ||
    String(a.studentName || "").localeCompare(String(b.studentName || ""))
  ), [results]);
  const filtered = sorted.filter(r =>
    `${r.studentName || ""} ${r.userId || r.studentId || ""}`.toLowerCase().includes(query.toLowerCase())
  );
  const average = results.length ? results.reduce((s, r) => s + Number(r.percentage ?? (r.total ? r.score * 100 / r.total : 0)), 0) / results.length : 0;

  function downloadPdf() { window.print(); }

  return <>
    <PageTitle title="Student Results" subtitle="Official quiz result sheets, student-wise performance and printable reports." />
    <ErrorBox>{error || failure}</ErrorBox>
    <section className="panel-card mb-6 p-5 no-print">
      <label className="field-label" htmlFor="result-quiz">Select quiz</label>
      <select id="result-quiz" className="field-input standalone max-w-xl" value={quizId} onChange={e => load(e.target.value)}>
        <option value="">Choose one of your quizzes</option>
        {mine.map(q => <option key={q.id} value={q.id}>{q.topic || q.title || `Quiz #${q.id}`}</option>)}
      </select>
    </section>

    <div className="mb-6 grid gap-4 sm:grid-cols-3 no-print">
      <StatCard label="Total Attempts" value={results.length} icon={ClipboardCheck} />
      <StatCard label="Students Participated" value={new Set(results.map(r => r.studentId)).size} icon={Users} tone="violet" />
      <StatCard label="Average Percentage" value={`${number(average, 1)}%`} icon={TrendingUp} tone="emerald" />
    </div>

    <section className="panel-card overflow-hidden print-area" id="teacher-result-sheet">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center no-print">
        <div><h2 className="font-semibold text-slate-900">Quiz Result Sheet</h2><p className="mt-1 text-xs text-slate-500">Serial order · Student name · ID · Obtained marks · Total marks</p></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="input-icon-wrap w-full sm:w-60"><Search size={17} /><input className="field-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search student..." /></div>
          <button type="button" onClick={downloadPdf} disabled={!quizId || !results.length} className="btn-primary"><Download size={16} /> Download PDF</button>
        </div>
      </div>
      <div className="result-print-heading">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-700"><FileText size={16}/> QuizRank · Academic Result Sheet</div>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{selectedQuiz?.topic || "Student Quiz Results"}</h2>
        <p className="mt-1 text-sm text-slate-600">Teacher: {user?.name || "—"} · Generated: {new Date().toLocaleDateString()}</p>
      </div>
      {busy || loading ? <Loading text="Loading results..." /> : !quizId || !filtered.length ?
        <div className="p-5"><EmptyState title={quizId ? "No results found" : "Select a quiz"} message={quizId ? "No student submissions are available for this quiz." : "Choose a quiz above to view and download its result sheet."} /></div> :
        <div className="overflow-x-auto">
          <table className="result-table">
            <thead><tr><th>SL</th><th>Student Name</th><th>Student ID</th><th>Obtained</th><th>Total</th><th>Percentage</th><th>Submitted At</th></tr></thead>
            <tbody>{filtered.map((r, i) => { const total = Number(r.total || 0); const score = Number(r.score || 0); const pct = Number(r.percentage ?? (total ? score * 100 / total : 0)); return <tr key={r.id || `${r.studentId}-${i}`}><td>{i + 1}</td><td className="font-semibold">{r.studentName || `Student ${r.studentId}`}</td><td>{r.userId || r.studentId || "—"}</td><td>{score}</td><td>{total}</td><td>{number(pct, 1)}%</td><td>{dateText(r.submittedAt)}</td></tr>; })}</tbody>
          </table>
        </div>
      }
      <div className="result-print-footer">Generated by QuizRank Workspace · This report contains submitted quiz results only.</div>
    </section>
  </>;
}
