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
        <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">

          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100 bg-[#f1faf5] p-5 sm:p-6">

            <div className="flex items-center gap-3">

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d0fae5] text-emerald-800">
                <BookOpen size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-emerald-900">
                  Assigned Courses
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your teaching courses and quiz information
                </p>
              </div>

            </div>

            <span className="rounded-full bg-[#d0fae5] px-4 py-2 text-sm font-semibold text-emerald-800">
              {courses.length} Total Courses
            </span>

          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px] text-left">

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

                  <th className="border-r border-white/20 px-6 py-5 text-center">
                    Batch
                  </th>

                  <th className="border-r border-white/20 px-6 py-5 text-center">
                    Total Quiz
                  </th>

                  <th className="px-6 py-5 text-center">
                    Action
                  </th>

                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-emerald-100">

                {courses.map((course, index) => {

                  const count = (quizState.data || []).filter(
                    (quiz) => quiz.subjectId === course.id
                  ).length;

                  return (
                    <tr
                      key={course.id}
                      className="bg-[#f8fdf9] transition hover:bg-[#effaf4]"
                    >

                      {/* Serial */}
                      <td className="border-r border-emerald-100 px-6 py-5">
                        <span className="text-sm font-medium text-slate-700">
                          {index + 1}
                        </span>
                      </td>

                      {/* Course Name */}
                      <td className="border-r border-emerald-100 px-6 py-5">

                        <div className="flex items-center gap-4">

                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-emerald-800">
                            <BookOpen size={22} />
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                              {course.name ||
                                course.subjectName ||
                                course.courseName ||
                                "Untitled Course"}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              Assigned Course
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Course Code */}
                      <td className="border-r border-emerald-100 px-6 py-5">

                        <span className="inline-flex items-center rounded-lg border border-emerald-200 bg-[#eaf8f0] px-4 py-3 font-mono text-xs font-semibold text-emerald-800">
                          <Hash size={13} className="mr-1" />
                          {course.courseCode || course.code || "—"}
                        </span>

                      </td>

                      {/* Batch */}
                      <td className="border-r border-emerald-100 px-6 py-5 text-center">

                        <span className="inline-flex items-center rounded-full bg-[#d0fae5] px-4 py-2 text-sm font-semibold text-emerald-800">
                          {course.batch || "—"}
                        </span>

                      </td>

                      {/* Total Quiz */}
                      <td className="border-r border-emerald-100 px-6 py-5 text-center">

                        <span className="inline-flex h-10 min-w-12 items-center justify-center gap-1 rounded-full bg-[#d0fae5] px-4 text-sm font-bold text-emerald-800">

                          <ClipboardList size={15} />

                          {count}

                        </span>

                      </td>

                      {/* Action */}
                      <td className="px-6 py-5 text-center">

                        <Link
                          to="/teacher/create-quiz"
                          state={{
                            subjectId: course.id || course.subjectId,
                          }}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#006045] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#004d38]"
                        >
                          <Plus size={15} />
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
          <div className="flex items-center justify-between gap-3 border-t border-emerald-100 bg-[#f1faf5] px-5 py-4">

            <span className="text-xs text-slate-500">
              <BookOpen
                size={14}
                className="mr-1 inline text-emerald-700"
              />
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