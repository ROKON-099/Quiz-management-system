

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
const LIGHT_GREEN = "#d0fae5";

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
    <div className="space-y-6">
      <PageTitle
        title={`Welcome, ${fullName(user)}`}
        subtitle="Your academic overview and learning activities."
      />

      <ErrorBox>{error}</ErrorBox>

      {/* ==============================
          CGPA OVERVIEW
      ============================== */}
      <section className="panel-card flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
            <GraduationCap size={23} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#006045]">
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

        <div className="flex items-center gap-4 self-center sm:self-auto">
          {/* Small CGPA Circle */}
          <div
            className="relative grid h-[100px] w-[100px] shrink-0 place-items-center rounded-full"
            style={{
              background: `conic-gradient(${GREEN} ${cgpaPercentage}%, #e5e7eb ${cgpaPercentage}%)`,
            }}
          >
            <div className="grid h-[84px] w-[84px] place-items-center rounded-full bg-white">
              <div className="text-center">
                <p className="text-2xl font-bold leading-none text-[#006045]">
                  {academic.loading
                    ? "..."
                    : cgpa !== null
                      ? number(cgpa)
                      : "—"}
                </p>

                <p className="mt-1 text-[10px] font-medium text-slate-400">
                  OUT OF 4.00
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/student/profile"
            className="text-sm font-semibold text-[#006045]"
          >
            View Profile
          </Link>
        </div>
      </section>

      {/* ==============================
          SUMMARY CARDS
      ============================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Courses */}
        <Link
          to="/student/my-course"
          className="panel-card flex min-h-[116px] items-center gap-4 p-5"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
            <BookOpen size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">
              My Courses
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {courses.loading ? "..." : subjectCount}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Assigned courses
            </p>
          </div>
        </Link>

        {/* Quizzes */}
        <a
          href="#available-quizzes"
          className="panel-card flex min-h-[116px] items-center gap-4 p-5"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
            <ClipboardCheck size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">
              Available Quizzes
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {quizzes.loading ? "..." : quizCount}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Published quizzes
            </p>
          </div>
        </a>

        {/* Notices */}
        <a
          href="#latest-notices"
          className="panel-card flex min-h-[116px] items-center gap-4 p-5"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
            <Bell size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">
              Notices
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {notices.loading ? "..." : noticeCount}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Available announcements
            </p>
          </div>
        </a>

        {/* Batch Ranking */}
        <div className="panel-card flex min-h-[116px] items-center gap-4 p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
            <Trophy size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">
              Batch Ranking
            </p>

            {ranking.loading ? (
              <p className="mt-1 text-lg font-semibold text-slate-400">
                Loading...
              </p>
            ) : (
              <p className="mt-1 text-2xl font-bold text-[#006045]">
                {currentStudent?.batchRank != null
                  ? `#${currentStudent.batchRank}`
                  : "—"}
              </p>
            )}

            <p className="mt-1 text-xs text-slate-400">
              Your current batch position
            </p>
          </div>
        </div>
      </div>

      {/* ==============================
          QUIZZES & NOTICES
      ============================== */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">

        {/* Available Quizzes */}
        <section
          id="available-quizzes"
          className="panel-card scroll-mt-24 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-semibold text-slate-900">
                Available Quizzes
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Quizzes published by your teachers
              </p>
            </div>

            <Link
              to="/student/my-course"
              className="text-sm font-semibold text-[#006045]"
            >
              My Courses
            </Link>
          </div>

          {quizzes.loading ? (
            <Loading />
          ) : upcoming.length === 0 ? (
            <EmptyState
              title="No quizzes available"
              message="New quizzes will appear here when published."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {upcoming.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {quiz.title || quiz.topic || "Course Quiz"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {quiz.subject?.name ||
                        quiz.subjectName ||
                        "Course"}{" "}
                      · {quiz.totalQuestions || 10} questions
                    </p>
                  </div>

                  <Link
                    to={`/student/quiz/${quiz.id}`}
                    className="rounded-lg bg-[#006045] px-4 py-2 text-center text-sm font-semibold text-white"
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
          className="panel-card scroll-mt-24 overflow-hidden"
        >
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-semibold text-slate-900">
              Latest Notices
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Updates from your teachers
            </p>
          </div>

          {notices.loading ? (
            <Loading />
          ) : !notices.data?.length ? (
            <EmptyState title="No notices yet" />
          ) : (
            <div className="divide-y divide-slate-100">
              {notices.data.slice(0, 4).map((notice) => (
                <div className="p-4" key={notice.id}>
                  <p className="font-semibold text-slate-800">
                    {notice.topic || notice.title}
                  </p>

                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {notice.message}
                  </p>

                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
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
