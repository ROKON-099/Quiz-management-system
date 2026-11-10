

import {
  BookOpen,
  Plus,
  ClipboardList,
  Hash,
} from "lucide-react";

import { Link } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import { EmptyState, ErrorBox } from "../../components/common/Feedback";
import useAsync from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";
import { getTeacherCourses } from "../../services/courseService";
import { getQuizzes } from "../../services/quizService";
import Routine from "./Routine";

export default function MyCourse() {
  const { user } = useAuth();

  const id = user?.id || user?.userId;

  const {
    data,
    loading,
    error,
  } = useAsync(() => getTeacherCourses(id), [id]);

  const quizState = useAsync(getQuizzes, []);

  const courses = data || [];

  return (
    <div className="min-h-screen space-y-7 bg-[#f8fdf9] pb-8">

      {/* Page Header */}
      <PageTitle
        title="My Courses"
        subtitle="View and manage all courses assigned to your faculty account."
        action={
          <Link
            to="/teacher/create-quiz"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <Plus size={17} />
            Create Quiz
          </Link>
        }
      />

      <ErrorBox>{error || quizState.error}</ErrorBox>

      {/* Course Table */}
      {loading ? (
        <Loading />
      ) : !courses.length ? (
        <div className="rounded-2xl border border-emerald-100 bg-white p-6">
          <EmptyState
            title="No courses assigned"
            description="Your assigned courses will appear here."
          />
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white">

          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100 p-5 sm:p-6">

            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d0fae5] text-emerald-800">
                <BookOpen size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Assigned Courses
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Your teaching courses
                </p>
              </div>
            </div>

            <span className="rounded-lg bg-[#d0fae5] px-4 py-2 text-xs font-semibold text-emerald-800">
              {courses.length} Total Courses
            </span>

          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">

            <table className="w-full min-w-[750px] text-left">

              <thead>
                <tr className="border-b border-emerald-100 bg-[#f5fcf8] text-xs font-semibold uppercase tracking-wider text-emerald-900">
                  <th className="px-6 py-4">SL</th>
                  <th className="px-6 py-4">Course Name</th>
                  <th className="px-6 py-4">Course Code</th>
                  <th className="px-6 py-4">Batch</th>
                  <th className="px-6 py-4">Quizzes</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-emerald-50">

                {courses.map((course, index) => {

                  const count = (quizState.data || []).filter(
                    (quiz) => quiz.subjectId === course.id
                  ).length;

                  return (
                    <tr
                      key={course.id}
                      className="transition hover:bg-[#f8fdf9]"
                    >

                      {/* Serial */}
                      <td className="px-6 py-5">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d0fae5] text-sm font-bold text-emerald-800">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </td>

                      {/* Course */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">

                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f1fbf5] text-emerald-700">
                            <BookOpen size={19} />
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                              {course.name ||
                                course.subjectName ||
                                course.courseName ||
                                "Untitled Course"}
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                              Assigned Course
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* Course Code */}
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#f1fbf5] px-3 py-2 font-mono text-xs font-semibold text-emerald-800">
                          <Hash size={12} />
                          {course.courseCode || course.code || "—"}
                        </span>
                      </td>

                      {/* Batch */}
                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-600">
                          {course.batch || "—"}
                        </span>
                      </td>

                      {/* Quiz Count */}
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-[#f1fbf5] px-3 py-2">
                          <ClipboardList
                            size={16}
                            className="text-emerald-700"
                          />

                          <span className="text-sm font-semibold text-slate-800">
                            {count}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5 text-right">
                        <Link
                          to="/teacher/create-quiz"
                          state={{
                            subjectId: course.id || course.subjectId,
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2.5 text-xs font-semibold text-emerald-800 transition hover:bg-[#d0fae5]"
                        >
                          <Plus size={14} />
                          Create Quiz
                        </Link>
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-emerald-100 bg-[#f8fdf9] px-5 py-4">

            <span className="text-xs text-slate-500">
              <BookOpen size={14} className="mr-1 inline text-emerald-700" />
              Course Management
            </span>

            <span className="text-xs font-semibold text-emerald-800">
              {courses.length} Courses
            </span>

          </div>

        </section>
      )}

      {/* Teacher Weekly Routine */}
      <Routine courses={courses} />

    </div>
  );
}
