
import { Fragment, useEffect, useState } from "react";
import {
  RefreshCw,
  FileDown,
  ScanSearch,
} from "lucide-react";

import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import { ErrorBox, EmptyState } from "../../components/common/Feedback";
import { useAuth } from "../../context/AuthContext";

import {
  getAssignments,
  getAssignmentSubmissions,
} from "../../services/learningService";

import {
  getSimilarityReports,
  getPlagiarismStats,
  compareSubmissions,
  recheckSubmission,
  downloadSimilarityPdf,
} from "../../services/plagiarismService";

// Status badge colors
const badge = (status) => {
  if (status === "HIGH_SIMILARITY") {
    return "bg-rose-100 text-rose-700";
  }

  if (status === "NEEDS_REVIEW") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-emerald-100 text-emerald-700";
};

export default function Plagiarism() {
  const { user } = useAuth();
  const teacherId = user?.id;

  const [assignments, setAssignments] = useState([]);
  const [assignmentId, setAssignmentId] = useState("");

  const [reports, setReports] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    highSimilarity: 0,
    needsReview: 0,
    lowSimilarity: 0,
  });

  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  // Load teacher assignments
  useEffect(() => {
    if (!teacherId) return;

    getAssignments("TEACHER", teacherId)
      .then((data) => {
        setAssignments(data);

        if (data.length > 0) {
          setAssignmentId(String(data[0].id));
        }
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [teacherId]);

  // Load plagiarism reports, statistics and submissions
  async function load(id = assignmentId) {
    if (!id) return;

    setBusy(true);
    setError("");

    try {
      const [reportData, statsData, submissionData] =
        await Promise.all([
          getSimilarityReports(id, teacherId),
          getPlagiarismStats(id, teacherId),
          getAssignmentSubmissions(id, teacherId),
        ]);

      setReports(reportData);
      setStats(statsData);
      setSubmissions(submissionData);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // Reload when assignment changes
  useEffect(() => {
    if (assignmentId) {
      load(assignmentId);
    }
  }, [assignmentId]);

  // Manual PDF comparison
  async function manualCompare() {
    if (!a || !b || a === b) {
      setError("Select two different submissions.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await compareSubmissions({
        submissionAId: Number(a),
        submissionBId: Number(b),
        teacherId,
      });

      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // Recheck submission
  async function recheck(id) {
    setBusy(true);
    setError("");

    try {
      await recheckSubmission(id, teacherId);

      setError(
        "Recheck queued. Refresh in a moment to view the result."
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // Search and filter reports
  const filtered = reports.filter((r) => {
    const matchesStatus = !status || r.status === status;

    const searchText = `
      ${r.studentAName || ""}
      ${r.studentBName || ""}
      ${r.studentAUserId || ""}
      ${r.studentBUserId || ""}
    `.toLowerCase();

    const matchesQuery =
      !query || searchText.includes(query.toLowerCase());

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <PageTitle
        title="Plagiarism & Similarity"
        subtitle="Compare submitted PDFs within each assignment. Similarity is an indicator for teacher review, not proof of misconduct."
      />

      <ErrorBox>{error}</ErrorBox>

      {/* Assignment selection and statistics */}
      <section className="panel-card p-5">

        <label className="field-label">
          Select assignment
        </label>

        <select
          className="field-input standalone max-w-xl"
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
        >
          <option value="">Select assignment</option>

          {assignments.map((assignment) => (
            <option
              key={assignment.id}
              value={assignment.id}
            >
              {assignment.title}
            </option>
          ))}
        </select>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {[
            ["Total comparisons", stats.total],
            ["High similarity", stats.highSimilarity],
            ["Needs review", stats.needsReview],
            ["Low similarity", stats.lowSimilarity],
          ].map(([label, value]) => (
            <div
              className="rounded-xl bg-slate-50 p-4"
              key={label}
            >
              <p className="text-sm text-slate-500">
                {label}
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {value ?? 0}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* Manual comparison */}
      <section className="panel-card p-5">

        <h2 className="mb-3 font-bold">
          Manual comparison
        </h2>

        <div className="grid gap-3 md:grid-cols-3">

          {/* Submission selectors */}
          {[
            ["Submission A", a, setA],
            ["Submission B", b, setB],
          ].map(([label, value, setter]) => (
            <label
              className="text-sm font-medium text-slate-600"
              key={label}
            >
              {label}

              <select
                className="field-input standalone mt-1"
                value={value}
                onChange={(e) => setter(e.target.value)}
              >
                <option value="">
                  Select submission
                </option>

                {submissions.map((submission) => (
                  <option
                    key={submission.submissionId}
                    value={submission.submissionId}
                  >
                    {submission.studentName} ·{" "}
                    {submission.userId} · #
                    {submission.submissionId}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <button
            className="btn-primary self-end"
            disabled={busy || !assignmentId}
            onClick={manualCompare}
          >
            <ScanSearch size={16} />
            Compare PDFs
          </button>

        </div>
      </section>

      {/* Similarity reports */}
      <section className="panel-card overflow-hidden">

        {/* Report header and filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">

          <h2 className="font-bold">
            Similarity reports
          </h2>

          <div className="flex flex-wrap gap-2">

            <input
              className="field-input standalone"
              placeholder="Search student..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <select
              className="field-input standalone"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="HIGH_SIMILARITY">
                High similarity
              </option>
              <option value="NEEDS_REVIEW">
                Needs review
              </option>
              <option value="LOW_SIMILARITY">
                Low similarity
              </option>
            </select>

            <button
              className="btn-secondary"
              disabled={busy || !assignmentId}
              onClick={() => load()}
            >
              <RefreshCw size={15} />
              Refresh
            </button>

          </div>
        </div>

        {/* Report content */}
        {busy ? (
          <div className="p-5">
            <Loading />
          </div>
        ) : !filtered.length ? (
          <div className="p-5">
            <EmptyState
              title="No similarity reports yet"
              message="Reports are generated automatically after students submit PDFs, or use manual comparison above."
            />
          </div>
        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px] text-left text-sm">

              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">
                    Students
                  </th>

                  <th className="px-4 py-3">
                    Similarity
                  </th>

                  <th className="px-4 py-3">
                    Cosine / Jaccard / N-gram
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>

                  <th className="px-4 py-3">
                    Matched phrases
                  </th>

                  <th className="px-4 py-3">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {filtered.map((report) => (
                  <Fragment key={report.id}>

                    {/* Main report row */}
                    <tr>

                      <td className="px-4 py-3">
                        <b>{report.studentAName}</b>
                        {" vs "}
                        <b>{report.studentBName}</b>

                        <p className="text-xs text-slate-400">
                          {report.studentAUserId}
                          {" / "}
                          {report.studentBUserId}
                        </p>
                      </td>

                      <td className="px-4 py-3 font-bold">
                        {report.similarityPercent}%
                      </td>

                      <td className="px-4 py-3">
                        {report.cosinePercent}% /{" "}
                        {report.jaccardPercent}% /{" "}
                        {report.ngramPercent}%
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${badge(
                            report.status
                          )}`}
                        >
                          {(report.status || "UNKNOWN").replaceAll(
                            "_",
                            " "
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {report.matchedCount ?? 0}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">

                          <button
                            className="btn-secondary"
                            onClick={() =>
                              setExpanded(
                                expanded === report.id
                                  ? null
                                  : report.id
                              )
                            }
                          >
                            View
                          </button>

                          <button
                            className="btn-secondary"
                            onClick={() =>
                              downloadSimilarityPdf(
                                report.id,
                                teacherId
                              )
                            }
                          >
                            <FileDown size={14} />
                            PDF
                          </button>

                        </div>
                      </td>

                    </tr>

                    {/* Expanded matching text */}
                    {expanded === report.id && (
                      <tr>
                        <td
                          colSpan="6"
                          className="bg-slate-50 px-5 py-4"
                        >

                          <p className="mb-2 font-semibold">
                            Exact matching sentences (
                            {report.matchedCount ?? 0})
                          </p>

                          <pre className="whitespace-pre-wrap text-sm text-slate-700">
                            {report.matchedText ||
                              "No exact matching sentences were found. Similarity can still be based on token and phrase overlap."}
                          </pre>

                        </td>
                      </tr>
                    )}

                  </Fragment>
                ))}

              </tbody>

            </table>
          </div>
        )}

      </section>

    </div>
  );
}

