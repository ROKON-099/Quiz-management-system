
import { useState } from "react";
import {
  CalendarDays,
  Download,
  FileText,
  UploadCloud,
  Award,
  CheckCircle2,
  Clock,
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

import {
  getAssignments,
  submitAssignment,
  getStudentAssignmentResults,
  downloadLearningFile,
} from "../../services/learningService";

import { displayDate } from "../../utils/format";

export default function Assignments() {
  const { user } = useAuth();
  const id = user?.id ?? user?.userId;

  const {
    data,
    loading,
    error,
    refetch,
  } = useAsync(() => getAssignments("STUDENT", id), [id]);

  const results = useAsync(
    () => getStudentAssignmentResults(id),
    [id]
  );

  const [files, setFiles] = useState({});
  const [submittedIds, setSubmittedIds] = useState({});
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState("");
  const [fail, setFail] = useState("");

  // Check whether the student has already submitted this assignment.
  function hasSubmitted(a) {
    return (
      submittedIds[a.id] === true ||
      a.submitted === true ||
      a.alreadySubmitted === true ||
      a.submissionId != null ||
      a.submission?.id != null
    );
  }

  // Get submission date from backend response.
  function getSubmissionDate(a) {
    return (
      a.submittedAt ||
      a.submissionDate ||
      a.submission?.submittedAt ||
      null
    );
  }

  async function submit(a) {
    const file = files[a.id];

    if (hasSubmitted(a)) {
      setFail("You have already submitted this assignment.");
      return;
    }

    if (!file) {
      setFail("Choose your completed assignment PDF first.");
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setFail("Only PDF files are allowed.");
      return;
    }

    const fd = new FormData();
    fd.append("studentId", id);
    fd.append("file", file);

    setBusy(a.id);
    setFail("");
    setMsg("");

    try {
      await submitAssignment(a.id, fd);

      // Immediately mark this assignment as submitted.
      setSubmittedIds((previous) => ({
        ...previous,
        [a.id]: true,
      }));

      setFiles((previous) => ({
        ...previous,
        [a.id]: null,
      }));

      setMsg(`Your submission for "${a.title}" was uploaded successfully.`);

      // Refresh assignment list to get updated submission status.
      await refetch();

    } catch (e) {
      setFail(
        e.response?.data?.message ||
        e.message ||
        "Assignment submission failed."
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">

      <PageTitle
        title="Assignments"
        subtitle="Download assignment briefs, submit your completed PDF and check teacher feedback."
      />

      <ErrorBox>{error || fail}</ErrorBox>
      <SuccessBox>{msg}</SuccessBox>

      {/* Assignment List */}
      {loading ? (
        <Loading />
      ) : !data?.length ? (
        <div className="panel-card">
          <EmptyState
            title="No assignments available"
            message="Your teachers have not published any assignments for your courses."
          />
        </div>
      ) : (
        <div className="grid gap-4">

          {data.map((a) => {
            const submitted = hasSubmitted(a);
            const submittedAt = getSubmissionDate(a);

            return (
              <article
                key={a.id}
                className="panel-card p-5 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row">

                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <FileText />
                  </span>

                  <div className="min-w-0 flex-1">

                    {/* Assignment Header */}
                    <div className="flex flex-wrap items-start justify-between gap-2">

                      <h2 className="font-bold text-slate-900">
                        {a.title}
                      </h2>

                      {submitted ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 size={14} />
                          Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          <CalendarDays size={13} />
                          Due {displayDate(a.dueDate)}
                        </span>
                      )}

                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {a.description ||
                        "Download the assignment brief and upload your completed work."}
                    </p>

                    {/* Download Assignment */}
                    <div className="mt-4">

                      <button
                        className="btn-secondary"
                        onClick={() =>
                          downloadLearningFile(
                            `/assignments/${a.id}/download`,
                            a.fileName
                          )
                        }
                      >
                        <Download size={16} />
                        Download brief
                      </button>

                    </div>

                    {/* Submission Status */}
                    {submitted ? (

                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                        <div className="flex items-center gap-2 font-semibold text-emerald-800">
                          <CheckCircle2 size={18} />
                          Assignment Submitted Successfully
                        </div>

                        <p className="mt-2 text-sm text-emerald-700">
                          You have already submitted this assignment.
                          You cannot submit it again.
                        </p>

                        {submittedAt && (
                          <p className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                            <Clock size={14} />
                            Submitted: {new Date(submittedAt).toLocaleString()}
                          </p>
                        )}

                      </div>

                    ) : (

                      /* Upload Form */
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">

                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          disabled={busy === a.id}
                          onChange={(e) =>
                            setFiles((previous) => ({
                              ...previous,
                              [a.id]: e.target.files?.[0] || null,
                            }))
                          }
                          className="min-w-0 flex-1 rounded-xl border border-slate-200 p-2 text-xs"
                        />

                        <button
                          disabled={busy === a.id || submitted}
                          onClick={() => submit(a)}
                          className="btn-primary whitespace-nowrap"
                        >
                          <UploadCloud size={16} />

                          {busy === a.id
                            ? "Submitting..."
                            : "Submit PDF"}
                        </button>

                      </div>

                    )}

                  </div>
                </div>
              </article>
            );
          })}

        </div>
      )}

      {/* Assignment Feedback & Results */}
      <section className="panel-card overflow-hidden">

        <div className="flex items-center gap-2 border-b border-slate-100 p-5">

          <Award className="text-emerald-700" />

          <div>
            <h2 className="font-bold text-slate-900">
              Assignment feedback & results
            </h2>

            <p className="text-xs text-slate-500">
              Marking saved by your teacher.
            </p>
          </div>

        </div>

        {results.loading ? (
          <div className="p-5">
            <Loading />
          </div>
        ) : !results.data?.length ? (
          <div className="p-5">
            <EmptyState title="No graded assignments yet" />
          </div>
        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[600px] text-left text-sm">

              <thead className="bg-emerald-50 text-xs uppercase text-emerald-900">

                <tr>
                  <th className="px-5 py-3">SL</th>
                  <th className="px-5 py-3">Assignment</th>
                  <th className="px-5 py-3">Marking</th>
                  <th className="px-5 py-3">Feedback</th>
                  <th className="px-5 py-3">Graded date</th>
                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {results.data.map((r, i) => (

                  <tr key={`${r.assignmentId}-${i}`}>

                    <td className="px-5 py-3">
                      {i + 1}
                    </td>

                    <td className="px-5 py-3 font-semibold">
                      {r.assignmentTitle}
                    </td>

                    <td className="px-5 py-3">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          r.grade === "GOOD"
                            ? "bg-emerald-100 text-emerald-700"
                            : r.grade === "POOR"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {r.grade}
                      </span>

                    </td>

                    <td className="px-5 py-3">
                      {r.feedback || "—"}
                    </td>

                    <td className="px-5 py-3">
                      {displayDate(r.gradedAt)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}
