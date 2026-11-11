import {
  BookOpen,
  Bell,
  ClipboardList,
  Users,
  Plus,
  ArrowUpRight,
  GraduationCap,
  Hash,
} from "lucide-react";

import { Link } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loading from "../../components/common/Loading";
import { EmptyState, ErrorBox } from "../../components/common/Feedback";
import useAsync from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";
import { getTeacherCourses } from "../../services/courseService";
import { getTeacherNotices } from "../../services/noticeService";
import { getQuizzes } from "../../services/quizService";
import { fullName } from "../../utils/format";

export default function Dashboard() {
  const { user } = useAuth();

  const id = user?.id || user?.userId;

  const courses = useAsync(() => getTeacherCourses(id), [id]);
  const notices = useAsync(() => getTeacherNotices(id), [id]);
  const quizzes = useAsync(getQuizzes, []);

  const mine = (quizzes.data || []).filter(
    (quiz) =>
      Number(quiz.createdBy) === Number(id) ||
      Number(quiz.teacherId) === Number(id)
  );

  const courseList = courses.data || [];

  return (
    <div className="min-h-screen space-y-7 bg-[#f8fdf9] pb-8">

      {/* Page Header */}
      <PageTitle
        title={`Welcome, ${fullName(user)}`}
        subtitle="Your academic workspace at a glance. Manage assigned courses, assessments and student progress."
        action={
          <Link
            to="/teacher/create-quiz"
            className="inline-flex items-center gap-2 rounded-xl bg-[#006045] px-5 py-3 text-sm font-semibold text-white"
          >
            <Plus size={17} />
            Create Quiz
          </Link>
        }
      />

      <ErrorBox>
        {courses.error || notices.error || quizzes.error}
      </ErrorBox>

      {/* Dashboard Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Assigned Courses"
          value={courses.loading ? "…" : courseList.length}
          icon={BookOpen}
        />

        <StatCard
          label="My Quizzes"
          value={quizzes.loading ? "…" : mine.length}
          icon={ClipboardList}
        />

        <StatCard
          label="Notices Published"
          value={notices.loading ? "…" : notices.data?.length || 0}
          icon={Bell}
        />

        <StatCard
          label="Teaching Workspace"
          value="Active"
          hint="Faculty account"
          icon={GraduationCap}
        />

      </div>

      {/* Assigned Courses */}
      <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">

        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100 bg-[#f0faf4] p-5 sm:p-6">

          <div className="flex items-center gap-3">

            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
              <BookOpen size={21} />
            </div>

            <h2 className="text-lg font-bold text-emerald-900">
  Assigned Courses
</h2>

<p className="mt-1 text-sm text-slate-500">
  Your teaching courses, listed in sequence.
</p>

          </div>

          <Link
            to="/teacher/my-course"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#006045]"
          >
            View All Courses
            <ArrowUpRight size={16} />
          </Link>

        </div>

        {/* Course Content */}
        {courses.loading ? (
          <Loading />
        ) : !courseList.length ? (

          <div className="p-6">
            <EmptyState
              title="No courses assigned"
              description="Courses assigned to your faculty account will appear here."
            />
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[750px] text-left">

              {/* Table Header */}
              <thead>
                <tr className="bg-[#006045] text-xs font-bold uppercase tracking-wide text-white">

                  <th className="border-r border-white/20 px-6 py-5">
                    Serial
                  </th>

                  <th className="border-r border-white/20 px-6 py-5">
                    Course Name
                  </th>

                  <th className="border-r border-white/20 px-6 py-5">
                    Course Code
                  </th>

                  <th className="border-r border-white/20 px-6 py-5">
                    Batch
                  </th>

                  <th className="px-6 py-5 text-center">
                    Action
                  </th>

                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-emerald-100">

                {courseList.map((course, index) => (

                  <tr
                    key={course.id ?? course.subjectId ?? index}
                    className="bg-[#f8fdf9]"
                  >

                    {/* Serial */}
                    <td className="border-r border-emerald-100 px-6 py-5">

                      <span className="text-sm font-medium text-slate-700">
                        {index + 1}
                      </span>

                    </td>

                    {/* Course Name */}
                    <td className="border-r border-emerald-100 px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-emerald-800">
                          <BookOpen size={20} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {course.name ||
                              course.subjectName ||
                              course.courseName ||
                              "Untitled course"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {course.batch
                              ? `${course.batch} batch`
                              : "Assigned course"}
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* Course Code */}
                    <td className="border-r border-emerald-100 px-6 py-5">

                      <span className="inline-flex items-center rounded-lg border border-emerald-200 bg-[#eaf8f0] px-3 py-2 font-mono text-xs font-semibold text-emerald-800">
                        <Hash size={13} className="mr-1" />
                        {course.courseCode || course.code || "—"}
                      </span>

                    </td>

                    {/* Batch */}
                    <td className="border-r border-emerald-100 px-6 py-5">

                      <span className="inline-flex rounded-full bg-[#d0fae5] px-4 py-2 text-sm font-semibold text-emerald-800">
                        {course.batch || "—"}
                      </span>

                    </td>

                    {/* Action */}
                    <td className="px-6 py-5 text-right">

                      <Link
                        to="/teacher/create-quiz"
                        state={{
                          subjectId: course.id || course.subjectId,
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#006045] px-4 py-2.5 text-xs font-semibold text-white"
                      >
                        <Plus size={15} />
                        Create Quiz
                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

        {/* Table Footer */}
        <div className="flex items-center justify-between border-t border-emerald-100 bg-[#f0faf4] px-5 py-4">

          <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
            <Hash size={14} className="text-emerald-700" />
            Course Sequence
          </span>

          <span className="text-xs font-semibold text-emerald-800">
            {courseList.length} Assigned{" "}
            {courseList.length === 1 ? "Course" : "Courses"}
          </span>

        </div>

      </section>

      {/* Quick Actions & Assessment Overview */}
      <div className="grid gap-6 xl:grid-cols-2">

        {/* Quick Actions */}
        <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white">

          {/* Dark Green Header */}
          <div className="flex items-center gap-3 border-b border-emerald-500/30 bg-[#006045] p-5 sm:p-6">

            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
              <ClipboardList size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-emerald-100">
                Common faculty tasks
              </p>
            </div>

          </div>

          {/* Quick Action Cards */}
          <div className="grid gap-3 p-5 sm:grid-cols-2">

            {/* Create Quiz */}
            <Link
              to="/teacher/create-quiz"
              className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-[#f0faf4] p-4"
            >

              <div className="flex items-center gap-3">

                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-emerald-800">
                  <ClipboardList size={21} />
                </div>

                <div>
                  <b className="block text-sm font-semibold text-emerald-950">
                    Create a Quiz
                  </b>

                  <small className="mt-1 block text-xs text-slate-500">
                    Prepare an assessment
                  </small>
                </div>

              </div>

              <ArrowUpRight size={17} className="shrink-0 text-emerald-700" />

            </Link>

            {/* Manage Notices */}
            <Link
              to="/teacher/notice"
              className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-[#f0faf4] p-4"
            >

              <div className="flex items-center gap-3">

                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-emerald-800">
                  <Bell size={21} />
                </div>

                <div>
                  <b className="block text-sm font-semibold text-emerald-950">
                    Manage Notices
                  </b>

                  <small className="mt-1 block text-xs text-slate-500">
                    Publish announcements
                  </small>
                </div>

              </div>

              <ArrowUpRight size={17} className="shrink-0 text-emerald-700" />

            </Link>

            {/* Student Results */}
            <Link
              to="/teacher/results"
              className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-[#f0faf4] p-4"
            >

              <div className="flex items-center gap-3">

                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-emerald-800">
                  <Users size={21} />
                </div>

                <div>
                  <b className="block text-sm font-semibold text-emerald-950">
                    Student Results
                  </b>

                  <small className="mt-1 block text-xs text-slate-500">
                    Review quiz performance
                  </small>
                </div>

              </div>

              <ArrowUpRight size={17} className="shrink-0 text-emerald-700" />

            </Link>

            {/* My Courses */}
            <Link
              to="/teacher/my-course"
              className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-[#f0faf4] p-4"
            >

              <div className="flex items-center gap-3">

                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-emerald-800">
                  <BookOpen size={21} />
                </div>

                <div>
                  <b className="block text-sm font-semibold text-emerald-950">
                    My Courses
                  </b>

                  <small className="mt-1 block text-xs text-slate-500">
                    View assigned courses
                  </small>
                </div>

              </div>

              <ArrowUpRight size={17} className="shrink-0 text-emerald-700" />

            </Link>

          </div>

        </section>

        {/* Assessment Overview */}
        <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white">

          {/* Dark Green Header */}
          <div className="flex items-center gap-3 border-b border-emerald-500/30 bg-[#006045] p-5 sm:p-6">

            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
              <ClipboardList size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Assessment Overview
              </h2>

              <p className="mt-1 text-sm text-emerald-100">
                Your quiz and assessment activities
              </p>
            </div>

          </div>

          {/* Assessment Content */}
          <div className="p-5 sm:p-6">

            <p className="text-sm leading-7 text-slate-600">
              Create quizzes for your assigned courses and review
              submissions from the Student Results workspace.
              Each quiz and its results remain associated with
              the course where it was created.
            </p>

            {/* Quiz Statistics */}
            <div className="mt-6 rounded-xl border border-emerald-200 bg-[#f0faf4] p-5">

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#d0fae5] text-emerald-800">
                      <ClipboardList size={18} />
                    </div>

                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                      Quizzes Created By You
                    </p>

                  </div>

                  <p className="mt-4 text-3xl font-bold text-emerald-900">
                    {quizzes.loading ? "—" : mine.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Total published quizzes
                  </p>

                </div>

                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#d0fae5] text-emerald-800">
                  <GraduationCap size={32} />
                </div>

              </div>

              <div className="mt-5 border-t border-emerald-200 pt-4">

                <Link
                  to="/teacher/results"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#006045] px-4 py-3 text-xs font-semibold text-white"
                >
                  View Student Results
                  <ArrowUpRight size={15} />
                </Link>

              </div>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}