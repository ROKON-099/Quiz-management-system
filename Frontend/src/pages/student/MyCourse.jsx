

import {
  BookOpen,
  ClipboardList,
  GraduationCap,
} from "lucide-react";

import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import {
  EmptyState,
  ErrorBox,
} from "../../components/common/Feedback";

import useAsync from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";

import { getStudentCourses } from "../../services/courseService";
import { getQuizzes } from "../../services/quizService";
import { getStudentResults } from "../../services/resultService";

import Routine from "./Routine";

export default function MyCourse() {
  const { user } = useAuth();

  const studentId = user?.id ?? user?.userId;

  // Fetch Student Courses
  const {
    data: courseData,
    loading: courseLoading,
    error: courseError,
  } = useAsync(
    () => getStudentCourses(studentId),
    [studentId]
  );

  // Fetch All Quizzes
  const {
    data: quizData,
    loading: quizLoading,
    error: quizError,
  } = useAsync(() => getQuizzes(), []);

  // Fetch Student Quiz Results
  const {
    data: resultData,
    loading: resultLoading,
    error: resultError,
  } = useAsync(
    () => getStudentResults(studentId),
    [studentId]
  );

  // Loading
  if (courseLoading || quizLoading || resultLoading) {
    return <Loading />;
  }

  // Error Handling
  if (courseError || quizError || resultError) {
    return (
      <ErrorBox
        message={
          courseError?.message ||
          quizError?.message ||
          resultError?.message ||
          "Failed to load courses"
        }
      />
    );
  }

  // Normalize Courses
  const courses = (
    Array.isArray(courseData) ? courseData : []
  )
    .map((item) => {
      const subject = item.subject || item;

      if (!subject) return null;

      return {
        ...subject,

        courseCode:
          subject.courseCode ||
          subject.code ||
          subject.subjectCode ||
          "",

        name:
          subject.name ||
          subject.subjectName ||
          subject.courseName ||
          "Unnamed Course",
      };
    })
    .filter(Boolean);

  // Normalize Quizzes
  const quizzes = Array.isArray(quizData)
    ? quizData
    : Array.isArray(quizData?.quizzes)
      ? quizData.quizzes
      : [];

  // Normalize Results
  const results = Array.isArray(resultData)
    ? resultData
    : Array.isArray(resultData?.results)
      ? resultData.results
      : [];

  // Calculate Course Statistics
  const courseStats = courses.map((course) => {
    const courseId = Number(course.id);

    // All quizzes under this course
    const courseQuizzes = quizzes.filter(
      (quiz) => Number(quiz.subjectId) === courseId
    );

    // Student results under this course
    const courseResults = results.filter(
      (result) => Number(result.courseId) === courseId
    );

    // Calculate average percentage
    const validResults = courseResults.filter(
      (result) =>
        Number.isFinite(Number(result.percentage)) &&
        result.percentage !== null &&
        result.percentage !== undefined
    );

    const average =
      validResults.length > 0
        ? validResults.reduce(
            (sum, result) => sum + Number(result.percentage),
            0
          ) / validResults.length
        : null;

    return {
      ...course,
      totalQuiz: courseQuizzes.length,
      attemptedQuiz: courseResults.length,
      average,
    };
  });

  // Summary Statistics
  const totalCourses = courseStats.length;

  const totalQuizzes = courseStats.reduce(
    (sum, course) => sum + course.totalQuiz,
    0
  );

  const totalAttempted = courseStats.reduce(
    (sum, course) => sum + course.attemptedQuiz,
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageTitle
        title="My Courses"
        subtitle="View your enrolled courses and quiz performance"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Total Courses */}
        <div className="rounded-2xl border border-[#dceee5] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#d0fae5] p-3 text-[#006045]">
              <BookOpen size={24} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total Courses
              </p>

              <h2 className="text-2xl font-bold text-slate-900">
                {totalCourses}
              </h2>
            </div>
          </div>
        </div>

        {/* Total Quizzes */}
        <div className="rounded-2xl border border-[#dceee5] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#d0fae5] p-3 text-[#006045]">
              <ClipboardList size={24} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total Quizzes
              </p>

              <h2 className="text-2xl font-bold text-slate-900">
                {totalQuizzes}
              </h2>
            </div>
          </div>
        </div>

        {/* Attempted Quizzes */}
        <div className="rounded-2xl border border-[#dceee5] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#d0fae5] p-3 text-[#006045]">
              <GraduationCap size={24} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Attempted Quizzes
              </p>

              <h2 className="text-2xl font-bold text-slate-900">
                {totalAttempted}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Table */}
      <div className="overflow-hidden rounded-2xl border border-[#cfe6d9] bg-white shadow-sm">

        {/* Table Header */}
        <div className="border-b border-[#dceee5] bg-[#f2fbf6] px-5 py-5 sm:px-6">
          <h2 className="text-lg font-semibold text-[#006045]">
            Enrolled Courses
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Course details and quiz performance
          </p>
        </div>

        {courseStats.length === 0 ? (
          <div className="p-6">
            <EmptyState message="No courses found" />
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[850px] table-auto text-left text-sm">

              {/* Table Head */}
              <thead className="bg-[#006045] text-xs uppercase tracking-wider text-white">
                <tr>
                  <th className="whitespace-nowrap border border-[#dceee5]/30 px-5 py-4">
                    Serial
                  </th>

                  <th className="whitespace-nowrap border border-[#dceee5]/30 px-5 py-4">
                    Course Name
                  </th>

                  <th className="whitespace-nowrap border border-[#dceee5]/30 px-5 py-4">
                    Course Code
                  </th>

                  <th className="whitespace-nowrap border border-[#dceee5]/30 px-5 py-4 text-center">
                    Total Quiz
                  </th>

                  <th className="whitespace-nowrap border border-[#dceee5]/30 px-5 py-4 text-center">
                    Attempted
                  </th>

                  <th className="whitespace-nowrap border border-[#dceee5]/30 px-5 py-4 text-center">
                    Result Avg
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-[#f8fdf9]">

                {courseStats.map((course, index) => (
                  <tr
                    key={course.id}
                    className="border-b border-[#dceee5] last:border-b-0"
                  >
                    {/* Serial */}
                    <td className="whitespace-nowrap border border-[#dceee5] px-5 py-4 font-medium text-slate-600">
                      {index + 1}
                    </td>

                    {/* Course Name */}
                    <td className="whitespace-nowrap border border-[#dceee5] px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#d0fae5] text-[#006045]">
                          <BookOpen size={18} />
                        </div>

                        <span className="font-semibold text-slate-800">
                          {course.name}
                        </span>
                      </div>
                    </td>

                    {/* Course Code - Single Line */}
                    <td className="whitespace-nowrap border border-[#dceee5] px-5 py-4">
                      <span className="inline-flex whitespace-nowrap rounded-lg border border-[#c6e9d5] bg-[#e9f9ef] px-3 py-2 text-xs font-bold tracking-wide text-[#006045]">
                        {course.courseCode || "N/A"}
                      </span>
                    </td>

                    {/* Total Quiz */}
                    <td className="whitespace-nowrap border border-[#dceee5] px-5 py-4 text-center">
                      <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-[#d0fae5] px-3 py-1 font-semibold text-[#006045]">
                        {course.totalQuiz}
                      </span>
                    </td>

                    {/* Attempted Quiz */}
                    <td className="whitespace-nowrap border border-[#dceee5] px-5 py-4 text-center">
                      <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-[#d0fae5] px-3 py-1 font-semibold text-[#006045]">
                        {course.attemptedQuiz}
                      </span>
                    </td>

                    {/* Average Result */}
                    <td className="whitespace-nowrap border border-[#dceee5] px-5 py-4 text-center">
                      {course.average !== null ? (
                        <span className="inline-flex rounded-full border border-[#c6e9d5] bg-[#e9f9ef] px-3 py-1.5 font-bold text-[#006045]">
                          {course.average.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
                          Not Attempted
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Weekly Routine */}
      <Routine courses={courseStats} />
    </div>
  );
}
