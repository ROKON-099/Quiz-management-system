
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Clock3,
  Flag,
  ChevronRight,
  Send,
  Trophy,
  RotateCcw,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import { ErrorBox } from "../../components/common/Feedback";

import { useAuth } from "../../context/AuthContext";

import {
  getQuiz,
  getQuizQuestions,
  startAttempt,
  submitAnswer,
  finishAttempt,
  checkAttempt,
} from "../../services/quizService";

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const studentId = user?.id ?? user?.userId;

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const [seconds, setSeconds] = useState(30);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Previous result
  const [previousResult, setPreviousResult] = useState(null);

  // Initialize Quiz
  useEffect(() => {
    let active = true;

    async function initializeQuiz() {
      try {
        setLoading(true);
        setError("");
        setPreviousResult(null);

        if (!studentId) {
          throw new Error(
            "Student information not found. Please login again."
          );
        }

        // 1. Get quiz information
        const quizData = await getQuiz(id);

        if (!active) return;

        setQuiz(quizData);

        // 2. Check previous attempt
        const status = await checkAttempt(studentId, id);

        if (!active) return;

        // 3. Already completed
        if (status.status === "COMPLETED") {
          setPreviousResult(status);
          return;
        }

        // 4. Get quiz questions
        const questionData = await getQuizQuestions(id);

        if (!active) return;

        const questionList = Array.isArray(questionData)
          ? questionData
          : [];

        setQuestions(questionList);

        if (questionList.length === 0) {
          throw new Error("No questions are available for this quiz.");
        }

        // 5. Start or resume previous attempt
        const attemptData = await startAttempt(studentId, id);

        if (!active) return;

        setAttempt(attemptData);

        // Resume from previously answered question count
        const currentIndex = Number(
          attemptData.currentQuestion || 0
        );

        if (currentIndex >= questionList.length) {
          // All questions already answered; finish the attempt.
          const result = await finishAttempt(attemptData.id);

          if (!active) return;

          setPreviousResult({
            attempted: true,
            inProgress: false,
            score: result.score,
            total: result.total,
            percentage:
              result.total > 0
                ? (result.score * 100) / result.total
                : 0,
            status: "COMPLETED",
          });

          return;
        }

        setIndex(currentIndex);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load quiz."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initializeQuiz();

    return () => {
      active = false;
    };
  }, [id, studentId]);

  // Current Question
  const current = questions[index];

  const selected = answers[index] ?? "";

  const options = useMemo(() => {
    if (!current) return [];

    return [
      current.optionA,
      current.optionB,
      current.optionC,
      current.optionD,
    ];
  }, [current]);

  // Reset Timer
  useEffect(() => {
    setSeconds(30);
  }, [index]);

  // Question Timer
  useEffect(() => {
    if (
      loading ||
      !attempt ||
      !current ||
      submitting ||
      previousResult
    ) {
      return;
    }

    if (seconds <= 0) {
      void goNext();
      return;
    }

    const timer = setTimeout(() => {
      setSeconds((value) => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    seconds,
    index,
    loading,
    attempt,
    current,
    submitting,
    previousResult,
  ]);

  // Next Question
  async function goNext() {
    if (submitting || !current || !attempt) return;

    setSubmitting(true);
    setError("");

    try {
      // Submit current answer
      await submitAnswer(attempt.id, {
        questionId: current.id,
        selectedAnswer: answers[index] || null,
      });

      if (index < questions.length - 1) {
        setIndex((value) => value + 1);
      } else {
        // Finish quiz
        const result = await finishAttempt(attempt.id);

        navigate(`/student/result/${result.id || id}`, {
          state: {
            result,
            quiz,
          },
          replace: true,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit answer."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Finish Quiz - No Confirmation Alert
  async function finish() {
    if (submitting) return;

    await goNext();
  }

  // Loading
  if (loading) {
    return <Loading text="Preparing your quiz..." />;
  }

  // Error
  if (error && !previousResult) {
    return (
      <>
        <PageTitle title="Quiz" />
        <ErrorBox>{error}</ErrorBox>
      </>
    );
  }

  // Previous Result
  if (previousResult) {
    return (
      <div className="space-y-6">
        <PageTitle
          title={quiz?.topic || quiz?.title || "Quiz Result"}
          subtitle="You have already completed this quiz."
        />

        <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-[#dceee5] bg-white shadow-sm">

          <div className="bg-gradient-to-r from-[#006045] to-[#087a5a] px-6 py-10 text-center text-white">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white/20">
              <Trophy size={34} />
            </div>

            <h2 className="text-2xl font-bold">
              Quiz Already Completed!
            </h2>

            <p className="mt-2 text-sm text-green-100">
              Your previous result is available below.
            </p>
          </div>

          <div className="p-6 sm:p-8">

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-2xl border border-[#dceee5] bg-[#f2fbf6] p-5 text-center">
                <p className="text-sm text-slate-500">
                  Obtained Marks
                </p>

                <h3 className="mt-2 text-3xl font-bold text-[#006045]">
                  {previousResult.score}

                  <span className="text-lg text-slate-400">
                    /{previousResult.total}
                  </span>
                </h3>
              </div>

              <div className="rounded-2xl border border-[#dceee5] bg-[#f2fbf6] p-5 text-center">
                <p className="text-sm text-slate-500">
                  Percentage
                </p>

                <h3 className="mt-2 text-3xl font-bold text-[#006045]">
                  {Number(
                    previousResult.percentage ?? 0
                  ).toFixed(2)}
                  %
                </h3>
              </div>

            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#c6e9d5] bg-[#f2fbf6] p-4">
              <CheckCircle2
                className="shrink-0 text-[#006045]"
                size={22}
              />

              <div>
                <p className="font-semibold text-[#006045]">
                  Submission Successful
                </p>

                <p className="text-sm text-slate-600">
                  You cannot attempt this quiz again.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <button
                onClick={() => navigate("/student/my-courses")}
                className="btn-primary justify-center"
              >
                <BookOpen size={18} />
                My Courses
              </button>

              <button
                onClick={() => navigate("/student")}
                className="btn-secondary justify-center"
              >
                <RotateCcw size={18} />
                Dashboard
              </button>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Not Available
  if (!current) {
    return (
      <>
        <PageTitle title={quiz?.topic || "Quiz"} />

        <div className="panel-card p-6 text-sm text-slate-500">
          No questions are available for this quiz.
        </div>
      </>
    );
  }

  // Quiz UI
  return (
    <>
      <PageTitle
        title={quiz?.title || quiz?.topic || "Quiz"}
        subtitle={`${questions.length} questions · 30 seconds per question`}
      />

      <div className="mx-auto max-w-4xl">

        {/* Question Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

          <div className="text-sm font-medium text-slate-500">
            Question {index + 1} of {questions.length}
          </div>

          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${
              seconds <= 8
                ? "bg-rose-50 text-rose-600"
                : "bg-[#e9f9ef] text-[#006045]"
            }`}
          >
            <Clock3 size={17} />
            {seconds}s remaining
          </div>

        </div>

        {/* Progress Bar */}
        <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#006045] transition-all duration-300"
            style={{
              width: `${
                ((index + 1) / questions.length) * 100
              }%`,
            }}
          />
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        {/* Question Card */}
        <section className="panel-card p-5 sm:p-8">

          <div className="mb-6 flex items-start gap-3">

            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#d0fae5] font-bold text-[#006045]">
              {index + 1}
            </span>

            <h2 className="text-lg font-semibold leading-7 text-slate-900">
              {current.questionText ||
                current.question ||
                current.text}
            </h2>

          </div>

          {/* MCQ Options */}
          <div className="grid gap-3">

            {options.map((option, i) => {
              const key = ["A", "B", "C", "D"][i];

              if (option === null || option === undefined) {
                return null;
              }

              return (
                <button
                  key={key}
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    setAnswers((a) => ({
                      ...a,
                      [index]: key,
                    }))
                  }
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 disabled:cursor-not-allowed ${
                    selected === key
                      ? "border-[#006045] bg-[#d0fae5] ring-2 ring-[#d0fae5]"
                      : "border-[#dceee5] bg-white hover:border-[#006045] hover:bg-[#f2fbf6]"
                  }`}
                >

                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold ${
                      selected === key
                        ? "bg-[#006045] text-white"
                        : "bg-[#e9f9ef] text-[#006045]"
                    }`}
                  >
                    {key}
                  </span>

                  <span className="text-sm text-slate-700">
                    {option}
                  </span>

                </button>
              );
            })}

          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-end border-t border-slate-100 pt-5">

            {index === questions.length - 1 ? (
              <button
                type="button"
                disabled={submitting}
                onClick={finish}
                className="btn-primary"
              >
                {submitting ? "Submitting..." : "Submit Quiz"}

                <Send size={17} />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={goNext}
                className="btn-primary"
              >
                {submitting ? "Saving..." : "Next Question"}

                <ChevronRight size={17} />
              </button>
            )}

          </div>

        </section>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Flag size={14} />
          Your answers are submitted as you move between questions.
        </p>

      </div>
    </>
  );
}
