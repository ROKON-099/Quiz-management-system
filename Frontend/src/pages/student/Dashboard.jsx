import { useMemo } from "react";

import {
  BookOpen,
  Bell,
  ClipboardCheck,
  Trophy,
  Clock3,
  GraduationCap,
} from "lucide-react";

import { Link } from "react-router-dom";

import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import { EmptyState, ErrorBox } from "../../components/common/Feedback";

import useAsync from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";

import { getStudentCourses } from "../../services/courseService";
import { getNotices } from "../../services/noticeService";
import { getQuizzes } from "../../services/quizService";
import { getAcademicRecordsPlaceholder } from "../../services/profileService";
import { getDepartmentLeaderboard } from "../../services/leaderboardService";

import { fullName, number } from "../../utils/format";

const GREEN = "#006045";

export default function Dashboard() {
  const { user } = useAuth();
  const id = user?.id || user?.userId;

  const courses = useAsync(
    () => (id ? getStudentCourses(id) : Promise.resolve([])),
    [id]
  );

  const notices = useAsync(getNotices, []);
  const quizzes = useAsync(getQuizzes, []);

  const academic = useAsync(
    () => (id ? getAcademicRecordsPlaceholder(id) : Promise.resolve([])),
    [id]
  );

  const ranking = useAsync(getDepartmentLeaderboard, []);

  // CGPA
  const academicRecords = Array.isArray(academic.data)
    ? academic.data
    : [];

  const currentRecord =
    academicRecords.find(
      (record) =>
        String(record.semester).toLowerCase() === "current"
    ) || academicRecords[0];

  const cgpa =
    currentRecord?.cgpa != null &&
    Number.isFinite(Number(currentRecord.cgpa))
      ? Number(currentRecord.cgpa)
      : null;

  const cgpaPercentage =
    cgpa !== null
      ? Math.max(0, Math.min((cgpa / 4) * 100, 100))
      : 0;

  // Batch Ranking
  const rankingRows = Array.isArray(ranking.data)
    ? ranking.data
    : [];

  const loggedInIds = [
    user?.id,
    user?.userId,
    user?.studentId,
  ]
    .filter((value) => value != null)
    .map(String);

  const currentStudent = rankingRows.find((student) => {
    const studentIds = [
      student?.userId,
      student?.studentId,
      student?.id,
    ]
      .filter((value) => value != null)
      .map(String);

    return loggedInIds.some((loginId) =>
      studentIds.includes(loginId)
    );
  });

  const upcoming = useMemo(
    () =>
      Array.isArray(quizzes.data)
        ? quizzes.data.slice(0, 5)
        : [],
    [quizzes.data]
  );

  const subjectCount = Array.isArray(courses.data)
    ? courses.data.length
    : 0;

  const quizCount = Array.isArray(quizzes.data)
    ? quizzes.data.length
    : 0;

  const noticeCount = Array.isArray(notices.data)
    ? notices.data.length
    : 0;

  const error =
    courses.error ||
    quizzes.error ||
    notices.error ||
    academic.error ||
    ranking.error;

  return (
    <div className="min-h-screen space-y-7 bg-[#f8fdf9] pb-8">

      {/* Page Header */}
      <PageTitle
        title={`Welcome, ${fullName(user)}`}
        subtitle="Your academic overview and learning activities."
      />

      <ErrorBox>{error}</ErrorBox>

      {/* CGPA Overview */}
      <section className="rounded-2xl border border-emerald-200 bg-white p-5 sm:p-7">

        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">

          <div className="flex items-center gap-4">

            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
              <GraduationCap size={28} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#006045]">
                Academic Performance
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Current CGPA
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your cumulative grade point average
              </p>
            </div>

          </div>

          {/* CGPA Circle */}
          <div className="flex items-center gap-5">

            <div
              className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full"
              style={{
                background: `conic-gradient(${GREEN} ${cgpaPercentage}%, #e5e7eb ${cgpaPercentage}%)`,
              }}
            >

              <div className="grid h-[94px] w-[94px] place-items-center rounded-full bg-white">

                <div className="text-center">

                  <p className="text-3xl font-extrabold leading-none text-[#006045]">
                    {academic.loading
                      ? "..."
                      : cgpa !== null
                        ? number(cgpa)
                        : "—"}
                  </p>

                  <p className="mt-2 text-[10px] font-semibold text-slate-400">
                    OUT OF 4.00
                  </p>

                </div>

              </div>

            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700">
                Your Academic Result
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {cgpa !== null
                  ? `${cgpaPercentage.toFixed(1)}% of maximum CGPA`
                  : "CGPA not available"}
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Courses */}
        <Link
          to="/student/my-course"
          className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-white p-5"
        >

          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
            <BookOpen size={23} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              My Courses
            </p>

            <p className="mt-1 text-2xl font-bold text-[#006045]">
              {courses.loading ? "..." : subjectCount}
            </p>
          </div>

        </Link>

        {/* Quizzes */}
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-white p-5">

          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
            <ClipboardCheck size={23} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Available Quizzes
            </p>

            <p className="mt-1 text-2xl font-bold text-[#006045]">
              {quizzes.loading ? "..." : quizCount}
            </p>
          </div>

        </div>

        {/* Notices */}
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-white p-5">

          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
            <Bell size={23} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Notices
            </p>

            <p className="mt-1 text-2xl font-bold text-[#006045]">
              {notices.loading ? "..." : noticeCount}
            </p>
          </div>

        </div>

        {/* Batch Ranking */}
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-white p-5">

          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
            <Trophy size={23} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Batch Ranking
            </p>

            <p className="mt-1 text-2xl font-bold text-[#006045]">
              {ranking.loading
                ? "..."
                : currentStudent?.batchRank != null
                  ? `#${currentStudent.batchRank}`
                  : "—"}
            </p>
          </div>

        </div>

      </div>

      {/* Available Quizzes & Latest Notices */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">

        {/* Available Quizzes */}
        <section
          id="available-quizzes"
          className="overflow-hidden rounded-2xl border border-emerald-200 bg-white"
        >

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-emerald-100 bg-[#f0faf4] p-5">

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
              <ClipboardCheck size={21} />
            </div>

            <div>
              <h2 className="font-bold text-emerald-950">
                Available Quizzes
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Quizzes published by your teachers
              </p>
            </div>

          </div>

          {/* Quiz List */}
          {quizzes.loading ? (

            <Loading />

          ) : upcoming.length === 0 ? (

            <div className="p-6">
              <EmptyState
                title="No quizzes available"
                message="New quizzes will appear here when published."
              />
            </div>

          ) : (

            <div className="divide-y divide-emerald-100">

              {upcoming.map((quiz) => (

                <div
                  key={quiz.id}
                  className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
                >

                  <div className="min-w-0">

                    <h3 className="text-sm font-bold text-slate-900">
                      {quiz.title || quiz.topic || "Course Quiz"}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {quiz.subject?.name ||
                        quiz.subjectName ||
                        "Course"}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {quiz.totalQuestions || 10} Questions
                      <span className="mx-2 text-emerald-300">|</span>
                      MCQ
                    </p>

                  </div>

                  <Link
                    to={`/student/quiz/${quiz.id}`}
                    className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#006045] px-5 py-2.5 text-xs font-semibold text-white"
                  >
                    Start Quiz
                  </Link>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* Latest Notices */}
        <section
          id="latest-notices"
          className="overflow-hidden rounded-2xl border border-emerald-200 bg-white"
        >

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-emerald-100 bg-[#f0faf4] p-5">

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
              <Bell size={21} />
            </div>

            <div>
              <h2 className="font-bold text-emerald-950">
                Latest Notices
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Updates from your teachers
              </p>
            </div>

          </div>

          {/* Notice List */}
          {notices.loading ? (

            <Loading />

          ) : !notices.data?.length ? (

            <div className="p-6">
              <EmptyState title="No notices yet" />
            </div>

          ) : (

            <div className="divide-y divide-emerald-100">

              {notices.data.slice(0, 4).map((notice) => (

                <div className="p-5" key={notice.id}>

                  <h3 className="text-sm font-bold text-slate-900">
                    {notice.topic || notice.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                    {notice.message}
                  </p>

                  <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock3 size={13} />

                    {notice.createdAt
                      ? new Date(
                          notice.createdAt
                        ).toLocaleDateString()
                      : "Notice"}
                  </p>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

    </div>
  );
}