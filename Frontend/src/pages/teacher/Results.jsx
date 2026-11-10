
import { useMemo, useState } from "react";

import {
  Search,
  Users,
  ClipboardCheck,
  TrendingUp,
  Download,
  FileText,
} from "lucide-react";

import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loading from "../../components/common/Loading";
import { EmptyState, ErrorBox } from "../../components/common/Feedback";

import useAsync from "../../hooks/useAsync";

import { getQuizzes } from "../../services/quizService";
import { getQuizResults } from "../../services/resultService";

import { useAuth } from "../../context/AuthContext";
import { number } from "../../utils/format";

const dateText = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString();
};

// Get student name from different possible API response formats
const getStudentName = (result) => {
  return (
    result.studentName ||
    result.student?.name ||
    result.user?.name ||
    `Student ${result.studentId || ""}`
  );
};

// Get institutional student ID
const getStudentUserId = (result) => {
  return (
    result.userId ||
    result.studentUserId ||
    result.student?.userId ||
    result.user?.userId ||
    result.studentId ||
    "—"
  );
};

// Calculate percentage
const getPercentage = (result) => {
  const total = Number(result.total ?? 0);
  const score = Number(result.score ?? 0);

  return Number(
    result.percentage ??
      (total > 0 ? (score * 100) / total : 0)
  );
};

export default function Results() {
  const { user } = useAuth();

  const teacherId = user?.id ?? user?.userId;

  const {
    data: quizzes,
    loading,
    error,
  } = useAsync(getQuizzes, []);

  const [quizId, setQuizId] = useState("");
  const [results, setResults] = useState([]);

  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [query, setQuery] = useState("");

  // Only show quizzes created by logged-in teacher
  const mine = (quizzes || []).filter(
    (quiz) =>
      Number(quiz.createdBy ?? quiz.teacherId) ===
      Number(teacherId)
  );

  const selectedQuiz = mine.find(
    (quiz) => String(quiz.id) === String(quizId)
  );

  // Load quiz results
  async function load(value) {
    setQuizId(value);
    setFailure("");
    setQuery("");

    if (!value) {
      setResults([]);
      return;
    }

    setBusy(true);

    try {
      const data = await getQuizResults(value);

      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setFailure(
        err.message || "Unable to load quiz results."
      );

      setResults([]);
    } finally {
      setBusy(false);
    }
  }

  // Sort results by score
  const sorted = useMemo(() => {
    return [...results].sort((a, b) => {
      const scoreDifference =
        Number(b.score || 0) - Number(a.score || 0);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return getStudentName(a).localeCompare(
        getStudentName(b)
      );
    });
  }, [results]);

  // Search by student name or student ID
  const filtered = useMemo(() => {
    const searchText = query.toLowerCase().trim();

    if (!searchText) return sorted;

    return sorted.filter((result) => {
      const searchableText = `
        ${getStudentName(result)}
        ${getStudentUserId(result)}
        ${result.studentId || ""}
      `.toLowerCase();

      return searchableText.includes(searchText);
    });
  }, [sorted, query]);

  // Statistics
  const average = results.length
    ? results.reduce(
        (sum, result) => sum + getPercentage(result),
        0
      ) / results.length
    : 0;

  const participatedStudents = new Set(
    results.map((result) => result.studentId)
  ).size;

  // Download / Print PDF
  function downloadPdf() {
    window.print();
  }

  return (
    <>
      <PageTitle
        title="Student Results"
        subtitle="Official quiz result sheets, student-wise performance and printable reports."
      />

      {(error || failure) && (
        <ErrorBox>{error || failure}</ErrorBox>
      )}

      {/* QUIZ SELECTOR */}
      <section className="panel-card mb-6 p-5 no-print">
        <label
          className="field-label"
          htmlFor="result-quiz"
        >
          Select Quiz
        </label>

        <select
          id="result-quiz"
          className="field-input standalone max-w-xl"
          value={quizId}
          onChange={(e) => load(e.target.value)}
        >
          <option value="">
            Choose one of your quizzes
          </option>

          {mine.map((quiz) => (
            <option key={quiz.id} value={quiz.id}>
              {quiz.topic ||
                quiz.title ||
                `Quiz #${quiz.id}`}
            </option>
          ))}
        </select>
      </section>

      {/* STATISTICS */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3 no-print">
        <StatCard
          label="Total Attempts"
          value={results.length}
          icon={ClipboardCheck}
        />

        <StatCard
          label="Students Participated"
          value={participatedStudents}
          icon={Users}
          tone="violet"
        />

        <StatCard
          label="Average Percentage"
          value={`${number(average, 1)}%`}
          icon={TrendingUp}
          tone="emerald"
        />
      </div>

      {/* RESULT SHEET */}
      <section
        className="panel-card overflow-hidden print-area"
        id="teacher-result-sheet"
      >
        {/* TOOLBAR */}
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center no-print">
          <div>
            <h2 className="font-semibold text-slate-900">
              Quiz Result Sheet
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Student name · Student ID · Obtained marks · Total marks
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="input-icon-wrap w-full sm:w-60">
              <Search size={17} />

              <input
                className="field-input"
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                placeholder="Search student..."
              />
            </div>

            <button
              type="button"
              onClick={downloadPdf}
              disabled={!quizId || !filtered.length}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </div>

        {/* PRINT HEADER */}
        <div className="result-print-heading p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
            <FileText size={16} />
            QuizRank · Academic Result Sheet
          </div>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {selectedQuiz?.topic ||
              selectedQuiz?.title ||
              "Student Quiz Results"}
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Teacher: {user?.name || "—"} · Generated:{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* RESULTS */}
        {busy || loading ? (
          <Loading text="Loading results..." />
        ) : !quizId || !filtered.length ? (
          <div className="p-5">
            <EmptyState
              title={
                quizId
                  ? "No results found"
                  : "Select a quiz"
              }
              message={
                quizId
                  ? "No student submissions are available for this quiz."
                  : "Choose a quiz above to view and download its result sheet."
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="result-table w-full">
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Obtained</th>
                  <th>Total</th>
                  <th>Percentage</th>
                  <th>Submitted At</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((result, index) => {
                  const total = Number(
                    result.total ?? 0
                  );

                  const score = Number(
                    result.score ?? 0
                  );

                  const percentage =
                    getPercentage(result);

                  return (
                    <tr
                      key={
                        result.id ||
                        `${result.studentId}-${index}`
                      }
                    >
                      <td>{index + 1}</td>

                      <td className="font-semibold text-slate-900">
                        {getStudentName(result)}
                      </td>

                      <td>
                        {getStudentUserId(result)}
                      </td>

                      <td className="font-semibold">
                        {score}
                      </td>

                      <td>{total}</td>

                      <td className="font-semibold text-emerald-700">
                        {number(percentage, 1)}%
                      </td>

                      <td>
                        {dateText(result.submittedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PRINT FOOTER */}
        <div className="result-print-footer p-5 text-xs text-slate-500">
          Generated by QuizRank Workspace · This report contains submitted quiz results only.
        </div>
      </section>
    </>
  );
}
