import { useState } from "react";
import {
  ClipboardList,
  Save,
  BookOpen,
  CalendarDays,
  Clock,
  FileText,
  CheckCircle2,
  Hash,
} from "lucide-react";

import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import { ErrorBox, SuccessBox } from "../../components/common/Feedback";
import useAsync from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";
import { getTeacherCourses } from "../../services/courseService";
import { createQuiz } from "../../services/quizService";

const newQuestion = () => ({
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
});

export default function CreateQuiz() {
  const { user } = useAuth();

  const teacherId = user?.id || user?.userId;

  const {
    data: courses,
    loading,
    error,
  } = useAsync(() => getTeacherCourses(teacherId), [teacherId]);

  const [form, setForm] = useState({
    subjectId: "",
    topic: "",
    quizDate: "",
    quizTime: "",
  });

  const [questions, setQuestions] = useState(
    Array.from({ length: 10 }, newQuestion)
  );

  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [failure, setFailure] = useState("");

  function updateQuestion(i, key, value) {
    setQuestions((q) =>
      q.map((x, index) =>
        index === i ? { ...x, [key]: value } : x
      )
    );
  }

  async function submit(e) {
    e.preventDefault();

    setBusy(true);
    setFailure("");
    setSuccess("");

    try {
      const payload = {
        createdBy: Number(teacherId),
        subjectId: Number(form.subjectId),
        topic: form.topic,
        quizDate: form.quizDate,
        quizTime: form.quizTime,

        questions: questions.map((q) => ({
          question: q.questionText.trim(),
          optionA: q.optionA.trim(),
          optionB: q.optionB.trim(),
          optionC: q.optionC.trim(),
          optionD: q.optionD.trim(),
          correctAnswer: q.correctAnswer,
        })),
      };

      await createQuiz(payload);

      setSuccess("Quiz created successfully.");

      setForm({
        subjectId: "",
        topic: "",
        quizDate: "",
        quizTime: "",
      });

      setQuestions(Array.from({ length: 10 }, newQuestion));

    } catch (err) {
      setFailure(err.message);
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <div className="min-h-screen space-y-7 bg-[#f8fdf9] pb-8">

      {/* Page Header */}
      <PageTitle
        title="Create Quiz"
        subtitle="Prepare a quiz with 10 multiple-choice questions."
      />

      {/* Notifications */}
      <ErrorBox>{error || failure}</ErrorBox>
      <SuccessBox>{success}</SuccessBox>

      {loading ? (
        <Loading />
      ) : (

        <form onSubmit={submit} className="space-y-7">

          {/* Quiz Information */}
          <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">

            {/* Section Header */}
            <div className="flex items-center gap-3 border-b border-emerald-100 bg-[#f0faf4] p-5 sm:p-6">

              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
                <ClipboardList size={23} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-emerald-950">
                  Quiz Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Basic details and quiz schedule
                </p>
              </div>

            </div>

            {/* Form Fields */}
            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

              {/* Course */}
              <div>
                <label className={labelClass}>
                  <BookOpen size={15} className="mr-2 inline text-[#006045]" />
                  Select Course
                </label>

                <select
                  className={inputClass}
                  value={form.subjectId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      subjectId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select a course</option>

                  {(courses || []).map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name || c.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quiz Topic */}
              <div>
                <label className={labelClass}>
                  <FileText size={15} className="mr-2 inline text-[#006045]" />
                  Quiz Topic
                </label>

                <input
                  type="text"
                  className={inputClass}
                  value={form.topic}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      topic: e.target.value,
                    })
                  }
                  required
                  placeholder="Enter quiz topic"
                />
              </div>

              {/* Quiz Date */}
              <div>
                <label className={labelClass}>
                  <CalendarDays size={15} className="mr-2 inline text-[#006045]" />
                  Quiz Date
                </label>

                <input
                  type="date"
                  className={inputClass}
                  value={form.quizDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quizDate: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* Quiz Time */}
              <div>
                <label className={labelClass}>
                  <Clock size={15} className="mr-2 inline text-[#006045]" />
                  Quiz Time
                </label>

                <input
                  type="time"
                  className={inputClass}
                  value={form.quizTime}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quizTime: e.target.value,
                    })
                  }
                  required
                />
              </div>

            </div>

            {/* Information Footer */}
            <div className="border-t border-emerald-100 bg-[#f8fdf9] px-5 py-3 sm:px-6">

              <p className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 size={15} className="text-[#006045]" />
                Select your assigned course before creating the quiz.
              </p>

            </div>

          </section>

          {/* Questions Section Header */}
          <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white">

            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#006045] p-5 sm:p-6">

              <div className="flex items-center gap-3">

                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
                  <ClipboardList size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">
                    Quiz Questions
                  </h2>

                  <p className="mt-1 text-sm text-emerald-100">
                    Create 10 multiple-choice questions
                  </p>
                </div>

              </div>

              <span className="rounded-full bg-[#d0fae5] px-4 py-2 text-sm font-bold text-[#006045]">
                {questions.length} / 10 Questions
              </span>

            </div>

            <div className="flex flex-wrap items-center gap-3 border-b border-emerald-100 bg-[#f0faf4] px-5 py-4">

              <span className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <Clock size={15} />
                30 Seconds Per Question
              </span>

              <span className="h-4 w-px bg-emerald-200" />

              <span className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <Hash size={15} />
                4 Options Per Question
              </span>

            </div>

          </div>

          {/* Individual Questions */}
          {questions.map((q, i) => (

            <section
              key={i}
              className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm"
            >

              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-emerald-100 bg-[#f0faf4] px-5 py-4 sm:px-6">

                <div className="flex items-center gap-3">

                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#006045] text-sm font-bold text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <h3 className="font-bold text-emerald-950">
                      Question {i + 1}
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Multiple Choice Question
                    </p>
                  </div>

                </div>

                <span className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800">
                  MCQ
                </span>

              </div>

              {/* Question Content */}
              <div className="space-y-5 p-5 sm:p-6">

                {/* Question Text */}
                <div>

                  <label className={labelClass}>
                    Write Your Question
                  </label>

                  <textarea
                    className={`${inputClass} min-h-24 resize-y`}
                    value={q.questionText}
                    onChange={(e) =>
                      updateQuestion(i, "questionText", e.target.value)
                    }
                    required
                    placeholder="Enter your question here..."
                  />

                </div>

                {/* Options */}
                <div>

                  <div className="mb-3 flex items-center justify-between">

                    <label className="text-sm font-semibold text-slate-700">
                      Answer Options
                    </label>

                    <span className="text-xs font-medium text-emerald-700">
                      Select one correct answer below
                    </span>

                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    {["A", "B", "C", "D"].map((letter) => (

                      <div key={letter}>

                        <label className="mb-2 block text-xs font-semibold text-slate-500">
                          Option {letter}
                        </label>

                        <div className="flex items-center gap-3">

                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-emerald-200 bg-[#d0fae5] text-sm font-bold text-[#006045]">
                            {letter}
                          </span>

                          <input
                            type="text"
                            className={inputClass}
                            value={q[`option${letter}`]}
                            onChange={(e) =>
                              updateQuestion(
                                i,
                                `option${letter}`,
                                e.target.value
                              )
                            }
                            required
                            placeholder={`Enter option ${letter}`}
                          />

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

                {/* Correct Answer */}
                <div className="rounded-xl border border-emerald-200 bg-[#f0faf4] p-4">

                  <div className="flex flex-wrap items-center justify-between gap-3">

                    <div className="flex items-center gap-2">

                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#d0fae5] text-[#006045]">
                        <CheckCircle2 size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-emerald-950">
                          Correct Answer
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Select the right option
                        </p>
                      </div>

                    </div>

                    <select
                      className="min-w-28 rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-[#006045] outline-none focus:border-emerald-700"
                      value={q.correctAnswer}
                      onChange={(e) =>
                        updateQuestion(
                          i,
                          "correctAnswer",
                          e.target.value
                        )
                      }
                    >
                      {["A", "B", "C", "D"].map((x) => (
                        <option key={x} value={x}>
                          Option {x}
                        </option>
                      ))}
                    </select>

                  </div>

                </div>

              </div>

            </section>

          ))}

          {/* Publish Section */}
          <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white">

            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#f0faf4] p-5 sm:px-6">

              <div className="flex items-center gap-3">

                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
                  <CheckCircle2 size={22} />
                </div>

                <div>
                  <h3 className="font-bold text-emerald-950">
                    Ready to Publish?
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Review all 10 questions before publishing.
                  </p>
                </div>

              </div>

              <button
                type="submit"
                disabled={busy || questions.some((q) => !q.questionText.trim())}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#006045] px-7 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={18} />
                {busy ? "Creating Quiz..." : "Publish Quiz"}
              </button>

            </div>

          </section>

        </form>

      )}

    </div>
  );
}