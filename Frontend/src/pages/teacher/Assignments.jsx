import { useState } from "react";
import {
  ClipboardList,
  Download,
  FilePlus2,
  FileText,
  UploadCloud,
  Users,
  FileDown,
  Save,
  X,
} from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import { useAuth } from "../../context/AuthContext";
import useAsync from "../../hooks/useAsync";
import Loading from "../../components/common/Loading";
import {
  EmptyState,
  ErrorBox,
  SuccessBox,
} from "../../components/common/Feedback";
import { getTeacherCourses } from "../../services/courseService";
import {
  getAssignments,
  publishAssignment,
  getAssignmentSubmissions,
  gradeAssignment,
  downloadLearningFile,
} from "../../services/learningService";
import { displayDate } from "../../utils/format";

export default function Assignments() {
  const { user } = useAuth();
  const teacherId = user?.id ?? user?.userId;
  const {
    data: assignments,
    loading,
    error,
    refetch,
  } = useAsync(() => getAssignments("TEACHER", teacherId), [teacherId]);
  const { data: courses } = useAsync(
    () => getTeacherCourses(teacherId),
    [teacherId],
  );
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    subjectId: "",
  });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [success, setSuccess] = useState("");
  const [selected, setSelected] = useState(null);
  const [rows, setRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [gradeDraft, setGradeDraft] = useState({});
  const [saving, setSaving] = useState(null);
  async function publish(e) {
    e.preventDefault();
    if (!file) {
      setFailure("Please choose an assignment PDF.");
      return;
    }
    const fd = new FormData();
    fd.append("teacherId", teacherId);
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "") fd.append(k, v);
    });
    fd.append("file", file);
    setBusy(true);
    setFailure("");
    setSuccess("");
    try {
      await publishAssignment(fd);
      setSuccess("Assignment published successfully.");
      setForm({ title: "", description: "", dueDate: "", subjectId: "" });
      setFile(null);
      e.target.reset();
      refetch();
    } catch (x) {
      setFailure(x.message);
    } finally {
      setBusy(false);
    }
  }
  async function openSubmissions(a) {
    setSelected(a);
    setTableLoading(true);
    setFailure("");
    try {
      const data = await getAssignmentSubmissions(a.id, teacherId);
      setRows(data);
      const drafts = {};
      data.forEach(
        (r) =>
          (drafts[r.submissionId] = {
            grade: r.grade || "AVG",
            feedback: r.feedback || "",
          }),
      );
      setGradeDraft(drafts);
    } catch (e) {
      setFailure(e.message);
    } finally {
      setTableLoading(false);
    }
  }
  async function saveGrade(row) {
    const d = gradeDraft[row.submissionId] || {};
    setSaving(row.submissionId);
    setFailure("");
    try {
      await gradeAssignment(selected.id, row.submissionId, teacherId, {
        grade: d.grade,
        feedback: d.feedback || "",
      });
      setSuccess(`Saved marking for ${row.studentName}.`);
      await openSubmissions(selected);
    } catch (e) {
      setFailure(e.message);
    } finally {
      setSaving(null);
    }
  }
  async function exportPdf() {
    try {
      await downloadLearningFile(
        `/assignments/${selected.id}/results/teacher/${teacherId}/pdf`,
        `${selected.title.replace(/[^a-z0-9-_]/gi, "_")}-results.pdf`,
      );
    } catch (e) {
      setFailure(e.message);
    }
  }
  return (
    <div className="space-y-6">
      <PageTitle
        title="Assignments"
        subtitle="Publish assignments, review student PDFs and record academic marking."
      />
      <ErrorBox>{error || failure}</ErrorBox>
      <SuccessBox>{success}</SuccessBox>
      <section className="panel-card p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <FilePlus2 />
          </span>
          <div>
            <h2 className="font-bold text-slate-900">Publish new assignment</h2>
            <p className="text-sm text-slate-500">
              Upload the assignment brief as a PDF.
            </p>
          </div>
        </div>
        <form onSubmit={publish} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">Assignment title</label>
            <input
              className="field-input standalone"
              maxLength="180"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Course / Subject</label>
            <select
              className="field-input standalone"
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            >
              <option value="">All students (general)</option>
              {(courses || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.subjectName}{" "}
                  {c.courseCode ? `(${c.courseCode})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Due date</label>
            <input
              type="date"
              className="field-input standalone"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Assignment PDF</label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full rounded-xl border border-slate-200 p-3 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Instructions</label>
            <textarea
              className="field-input standalone min-h-20"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="md:col-span-2">
            <button disabled={busy} className="btn-primary">
              <UploadCloud size={17} />
              {busy ? "Publishing..." : "Publish assignment"}
            </button>
          </div>
        </form>
      </section>
      <section>
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList className="text-emerald-700" />
          <h2 className="font-bold text-slate-900">Published assignments</h2>
        </div>
        {loading ? (
          <Loading />
        ) : !assignments?.length ? (
          <div className="panel-card">
            <EmptyState title="No assignments published yet" />
          </div>
        ) : (
          <div className="grid gap-3">
            {assignments.map((a) => (
              <article
                key={a.id}
                className="panel-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <FileText />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">{a.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Due: {displayDate(a.dueDate)} · {a.fileName}
                  </p>
                  {a.description && (
                    <p className="mt-1 text-sm text-slate-500">
                      {a.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      downloadLearningFile(
                        `/assignments/${a.id}/download`,
                        a.fileName,
                      )
                    }
                    className="btn-secondary"
                  >
                    <Download size={16} /> Brief PDF
                  </button>
                  <button
                    onClick={() => openSubmissions(a)}
                    className="btn-primary"
                  >
                    <Users size={16} /> Review submissions
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {selected && (
        <section className="panel-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold text-slate-900">
                Submission review · {selected.title}
              </h2>
              <p className="text-sm text-slate-500">
                Download each student's PDF and save POOR / AVG / GOOD marking.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportPdf} className="btn-secondary">
                <FileDown size={16} /> Export result PDF
              </button>
              <button
                onClick={() => setSelected(null)}
                className="icon-button"
                aria-label="Close"
              >
                <X />
              </button>
            </div>
          </div>
          {tableLoading ? (
            <div className="p-6">
              <Loading />
            </div>
          ) : !rows.length ? (
            <div className="p-5">
              <EmptyState title="No student submissions yet" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-emerald-50 text-xs uppercase tracking-wide text-emerald-900">
                  <tr>
                    <th className="px-4 py-3">SL</th>
                    <th className="px-4 py-3">Student name</th>
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Submitted time</th>
                    <th className="px-4 py-3">PDF</th>
                    <th className="px-4 py-3">Marking</th>
                    <th className="px-4 py-3">Feedback</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r, i) => (
                    <tr key={r.submissionId} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {r.studentName}
                      </td>
                      <td className="px-4 py-3">{r.userId || r.studentId}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.submittedAt
                          ? new Date(r.submittedAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            downloadLearningFile(
                              `/submissions/${r.submissionId}/download`,
                              r.fileName,
                            )
                          }
                          className="inline-flex items-center gap-1 font-semibold text-emerald-700"
                        >
                          <Download size={15} /> PDF
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="field-input standalone min-w-28"
                          value={gradeDraft[r.submissionId]?.grade || "AVG"}
                          onChange={(e) =>
                            setGradeDraft((v) => ({
                              ...v,
                              [r.submissionId]: {
                                ...v[r.submissionId],
                                grade: e.target.value,
                              },
                            }))
                          }
                        >
                          <option value="POOR">POOR</option>
                          <option value="AVG">AVG</option>
                          <option value="GOOD">GOOD</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="field-input standalone min-w-40"
                          placeholder="Optional feedback"
                          value={gradeDraft[r.submissionId]?.feedback || ""}
                          onChange={(e) =>
                            setGradeDraft((v) => ({
                              ...v,
                              [r.submissionId]: {
                                ...v[r.submissionId],
                                feedback: e.target.value,
                              },
                            }))
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          disabled={saving === r.submissionId}
                          onClick={() => saveGrade(r)}
                          className="btn-primary whitespace-nowrap"
                        >
                          <Save size={15} />
                          {saving === r.submissionId ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
