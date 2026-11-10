
import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";

import {
  Award,
  CheckCircle2,
  Trophy,
  ArrowLeft,
  Download,
  FileText,
  UserRound,
  Hash,
  CalendarDays,
} from "lucide-react";

import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import { ErrorBox } from "../../components/common/Feedback";

import { useAuth } from "../../context/AuthContext";

import {
  getResultById,
  getStudentResults,
} from "../../services/resultService";

import { number } from "../../utils/format";

export default function Result() {
  const { id } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();

  const [result, setResult] = useState(state?.result || null);
  const [quiz, setQuiz] = useState(state?.quiz || null);

  const [loading, setLoading] = useState(!state?.result);
  const [error, setError] = useState("");

  // Load result
  useEffect(() => {
    let active = true;

    const loadResult = async () => {
      try {
        setLoading(true);
        setError("");

        // Use navigation state if available
        if (state?.result) {
          if (active) {
            setResult(state.result);
            setQuiz(state.quiz || state.result.quiz || null);
            setLoading(false);
          }
          return;
        }

        let found = null;

        // First try result by ID
        try {
          found = await getResultById(id);
        } catch {
          found = null;
        }

        // Fallback: get logged-in student's results
        if (!found) {
          const studentId = user?.id ?? user?.userId;

          if (!studentId) {
            throw new Error("Student information not found.");
          }

          const rows = await getStudentResults(studentId);

          found = (rows || []).find(
            (row) => String(row.id) === String(id)
          );
        }

        if (!active) return;

        if (found) {
          setResult(found);
          setQuiz(found.quiz || null);
        } else {
          setError("The requested result could not be found.");
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to load your result."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadResult();

    return () => {
      active = false;
    };
  }, [id, state, user]);

  if (loading) {
    return <Loading text="Loading your result..." />;
  }

  if (error || !result) {
    return (
      <>
        <PageTitle title="Quiz Result" />
        <ErrorBox>
          {error || "Result not found."}
        </ErrorBox>

        <div className="mt-5">
          <Link to="/student/dashboard" className="btn-secondary">
            <ArrowLeft size={17} />
            Dashboard
          </Link>
        </div>
      </>
    );
  }

  // Result information
  const score = Number(
    result.score ?? result.totalScore ?? 0
  );

  const total = Number(
    result.total ??
    result.totalQuestions ??
    result.totalMarks ??
    0
  );

  const percentage = Number(
    result.percentage ??
    (total > 0 ? (score * 100) / total : 0)
  );

  // Prefer backend student information
  const studentName =
    result.studentName ||
    user?.name ||
    "Unknown Student";

  const studentId =
    user?.userId ||
    result.userId ||
    "—";

  const quizTitle =
    quiz?.topic ||
    result.quiz?.topic ||
    result.quizTopic ||
    "Quiz Assessment";

  const submittedAt = result.submittedAt
    ? new Date(result.submittedAt).toLocaleString()
    : "—";

  return (
    <>
      <PageTitle
        title="Your Quiz Result"
        subtitle="Your official quiz submission summary."
      />

      <div className="mx-auto max-w-4xl">

        {/* RESULT SHEET */}
        <section
          className="panel-card p-6 sm:p-9 print-area"
          id="student-result-sheet"
        >

          {/* HEADER */}
          <div className="result-print-heading border-b border-slate-100 pb-6">

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
              <FileText size={16} />
              QuizRank · Student Result
            </div>

            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              {quizTitle}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Official quiz assessment result
            </p>

          </div>

          {/* STUDENT INFORMATION */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 text-indigo-700">
                <UserRound size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                  Student Name
                </p>

                <p className="truncate font-semibold text-slate-900">
                  {studentName}
                </p>
              </div>

            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-blue-700">
                <Hash size={21} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Student ID
                </p>

                <p className="font-semibold text-slate-900">
                  {studentId}
                </p>
              </div>

            </div>

          </div>

          {/* SCORE */}
          <div className="mt-9 text-center">

            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Trophy size={32} />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-slate-500">
              Final Score
            </p>

            <h2 className="mt-2 text-5xl font-extrabold tracking-tight text-slate-900">
              {score}

              <span className="text-2xl font-semibold text-slate-400">
                {" "} / {total}
              </span>
            </h2>

            <p className="mt-3 text-lg font-bold text-emerald-700">
              {number(percentage, 1)}%
            </p>

            <div className="mx-auto mt-5 h-2.5 max-w-sm overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, percentage)
                  )}%`,
                }}
              />
            </div>

          </div>

          {/* RESULT TABLE */}
          <div className="mt-9 overflow-x-auto">

            <table className="result-table w-full">

              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Obtained Marks</th>
                  <th>Total Marks</th>
                  <th>Percentage</th>
                  <th>Submitted At</th>
                </tr>
              </thead>

              <tbody>
                <tr>

                  <td className="font-semibold">
                    {studentName}
                  </td>

                  <td>
                    {studentId}
                  </td>

                  <td>{score}</td>

                  <td>{total}</td>

                  <td className="font-semibold text-emerald-700">
                    {number(percentage, 1)}%
                  </td>

                  <td>{submittedAt}</td>

                </tr>
              </tbody>

            </table>

          </div>

          {/* SUCCESS MESSAGE */}
          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 no-print">

            <CheckCircle2 size={18} />

            Your quiz result has been saved successfully.

          </div>

          {/* PRINT FOOTER */}
          <div className="result-print-footer mt-8 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
            Generated by QuizRank Workspace · Keep this result sheet for your records.
          </div>

        </section>

        {/* ACTION BUTTONS */}
        <div className="no-print mt-6 flex flex-wrap justify-center gap-3">

          <Link
            to="/student/dashboard"
            className="btn-secondary"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="btn-primary"
          >
            <Download size={17} />
            Download PDF
          </button>

          <Link
            to="/leaderboard"
            className="btn-secondary"
          >
            <Award size={17} />
            Leaderboard
          </Link>

        </div>

      </div>
    </>
  );
}
