import { Fragment, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import { ErrorBox, EmptyState } from "../../components/common/Feedback";
import { useAuth } from "../../context/AuthContext";

import { getAssignments } from "../../services/learningService";

import {
  getSimilarityReports,
  getPlagiarismStats,
} from "../../services/plagiarismService";

// Status badge colors
const badge = (status) => {
  if (status === "HIGH_SIMILARITY") {
    return "bg-rose-100 text-rose-700";
  }

  if (status === "NEEDS_REVIEW") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "LOW_SIMILARITY") {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-slate-100 text-slate-700";
};

const getStatus = (similarity) => {
  if (similarity >= 70) return "HIGH_SIMILARITY";
  if (similarity >= 30) return "NEEDS_REVIEW";
  return "LOW_SIMILARITY";
};

// Normalize report values
const getSubmissionInfo = (report) => {
  const submissionAId = Number(
    report.submissionAId ?? report.submissionA?.id ?? 0
  );

  const submissionBId = Number(
    report.submissionBId ?? report.submissionB?.id ?? 0
  );

  /*
   * Assumption:
   * The larger submission ID belongs to the newer submission.
   * Backend should ideally provide newSubmissionId explicitly.
   */

  if (submissionAId > submissionBId) {
    return {
      studentId: report.studentAId,
      studentName: report.studentAName,
      userId: report.studentAUserId,
      submissionId: submissionAId,
    };
  }

  return {
    studentId: report.studentBId,
    studentName: report.studentBName,
    userId: report.studentBUserId,
    submissionId: submissionBId,
  };
};

// Group all comparison reports by submitting student
const groupReportsByStudent = (reports) => {
  const groups = new Map();

  reports.forEach((report) => {
    const student = getSubmissionInfo(report);

    if (!student.studentId) return;

    const key = String(student.studentId);

    if (!groups.has(key)) {
      groups.set(key, {
        studentId: student.studentId,
        studentName: student.studentName,
        userId: student.userId,
        reports: [],
        highestReport: null,
      });
    }

    const group = groups.get(key);

    group.reports.push(report);

    const currentScore = Number(
      report.similarityPercent ?? 0
    );

    const highestScore = Number(
      group.highestReport?.similarityPercent ?? -1
    );

    if (currentScore > highestScore) {
      group.highestReport = report;
    }
  });

  return Array.from(groups.values())
    .map((group) => {
      const highest = group.highestReport;

      return {
        ...group,
        similarityPercent: Number(
          highest?.similarityPercent ?? 0
        ),
        status: getStatus(
          Number(highest?.similarityPercent ?? 0)
        ),
        matchedCount: highest?.matchedCount ?? 0,
      };
    })
    .sort(
      (a, b) =>
        b.similarityPercent - a.similarityPercent
    );
};

export default function Plagiarism() {
  const { user } = useAuth();
  const teacherId = user?.id;

  const [assignments, setAssignments] = useState([]);
  const [assignmentId, setAssignmentId] = useState("");

  const [reports, setReports] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    highSimilarity: 0,
    needsReview: 0,
    lowSimilarity: 0,
  });

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
        setError(
          e.message || "Failed to load assignments."
        );
      });
  }, [teacherId]);

  // Load all automatic comparison reports
  async function load(id = assignmentId) {
    if (!id) return;

    setBusy(true);
    setError("");

    try {
      const [reportData, statsData] = await Promise.all([
        getSimilarityReports(id, teacherId),
        getPlagiarismStats(id, teacherId),
      ]);

      setReports(
        Array.isArray(reportData) ? reportData : []
      );

      setStats(
        statsData || {
          total: 0,
          highSimilarity: 0,
          needsReview: 0,
          lowSimilarity: 0,
        }
      );
    } catch (e) {
      setError(
        e.message || "Failed to load similarity reports."
      );
    } finally {
      setBusy(false);
    }
  }

  // Reload when assignment changes
  useEffect(() => {
    if (assignmentId) {
      load(assignmentId);
    } else {
      setReports([]);
    }
  }, [assignmentId]);

  // Group comparison reports by student
  const groupedReports = useMemo(
    () => groupReportsByStudent(reports),
    [reports]
  );

  // Search and filter grouped students
  const filtered = groupedReports.filter((student) => {
    const matchesStatus =
      !status || student.status === status;

    const searchText = `
      ${student.studentName || ""}
      ${student.userId || ""}
    `.toLowerCase();

    const matchesQuery =
      !query ||
      searchText.includes(query.toLowerCase());

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <PageTitle
        title="Plagiarism & Similarity"
        subtitle="Automatic similarity analysis of student assignment submissions."
      />

      <ErrorBox>{error}</ErrorBox>

      {/* Assignment Selection and Statistics */}
      <section className="panel-card p-5">

        <label className="field-label">
          Select Assignment
        </label>

        <div className="flex flex-wrap items-center gap-3">

          <select
            className="field-input standalone max-w-xl"
            value={assignmentId}
            onChange={(e) => setAssignmentId(e.target.value)}
          >
            <option value="">
              Select assignment
            </option>

            {assignments.map((assignment) => (
              <option
                key={assignment.id}
                value={assignment.id}
              >
                {assignment.title}
              </option>
            ))}
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

        {/* Statistics */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {[
            ["Total Comparisons", stats.total],
            ["High Similarity", stats.highSimilarity],
            ["Needs Review", stats.needsReview],
            ["Low Similarity", stats.lowSimilarity],
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

      {/* Grouped Similarity Reports */}
      <section className="panel-card overflow-hidden">

        {/* Header and Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">

          <div>
            <h2 className="font-bold text-slate-900">
              Student Similarity Reports
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              One row per student. Showing the highest similarity score.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <input
              className="field-input standalone"
              placeholder="Search student name or ID..."
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
                High Similarity
              </option>

              <option value="NEEDS_REVIEW">
                Needs Review
              </option>

              <option value="LOW_SIMILARITY">
                Low Similarity
              </option>
            </select>

          </div>
        </div>

        {/* Table Content */}
        {busy ? (
          <div className="p-5">
            <Loading />
          </div>
        ) : !filtered.length ? (
          <div className="p-5">
            <EmptyState
              title="No similarity reports yet"
              message="Student similarity reports will appear automatically after PDF submissions are compared."
            />
          </div>
        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[750px] text-left text-sm">

              {/* Table Header */}
              <thead className="bg-[#d0fae5] text-xs uppercase text-slate-700">

                <tr>
                  <th className="px-5 py-4">
                    Student Name
                  </th>

                  <th className="px-5 py-4">
                    Similarity
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Matched Phrases
                  </th>

                  <th className="px-5 py-4 text-center">
                    Details
                  </th>
                </tr>

              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-200">

                {filtered.map((student) => (
                  <Fragment key={student.studentId}>

                    {/* One row per student */}
                    <tr className="transition hover:bg-slate-50">

                      {/* Student Name and ID */}
                      <td className="px-5 py-4">

                        <p className="font-semibold text-slate-900">
                          {student.studentName || "Unknown Student"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {student.userId || "N/A"}
                        </p>

                      </td>

                      {/* Highest Similarity */}
                      <td className="px-5 py-4">

                        <span className="text-lg font-bold text-slate-900">
                          {student.similarityPercent}%
                        </span>

                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold ${badge(
                            student.status
                          )}`}
                        >
                          {student.status.replaceAll(
                            "_",
                            " "
                          )}
                        </span>

                      </td>

                      {/* Matched Phrases */}
                      <td className="px-5 py-4">

                        <span className="font-semibold text-slate-700">
                          {student.matchedCount}
                        </span>

                      </td>

                      {/* Details */}
                      <td className="px-5 py-4 text-center">

                        <button
                          className="btn-secondary"
                          onClick={() =>
                            setExpanded(
                              expanded === student.studentId
                                ? null
                                : student.studentId
                            )
                          }
                        >
                          {expanded === student.studentId
                            ? "Hide"
                            : "View"}
                        </button>

                      </td>

                    </tr>

                    {/* Expanded Matching Text */}
                    {expanded === student.studentId && (
                      <tr>

                        <td
                          colSpan={5}
                          className="bg-slate-50 px-5 py-4"
                        >

                          <div className="space-y-4">

                            <p className="font-semibold text-slate-800">
                              Similarity Details (
                              {student.reports.length} comparisons)
                            </p>

                            {student.reports.map((report, index) => (

                              <div
                                key={report.id}
                                className="border-b border-slate-200 pb-4 last:border-0"
                              >

                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">

                                  <p className="text-sm font-semibold text-slate-700">
                                    Matching Result {index + 1}
                                  </p>

                                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    {report.similarityPercent ?? 0}% Similarity
                                  </span>

                                </div>

                                <p className="mb-2 text-sm text-slate-600">
                                  Matched phrases:{" "}
                                  {report.matchedCount ?? 0}
                                </p>

                                <pre className="whitespace-pre-wrap break-words rounded-lg border bg-white p-4 text-sm leading-7 text-slate-700">
                                  {report.matchedText ||
                                    "No matching text details available."}
                                </pre>

                              </div>

                            ))}

                          </div>

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