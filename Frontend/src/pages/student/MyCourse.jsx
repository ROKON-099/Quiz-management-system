import { BookOpen, ClipboardList, GraduationCap } from "lucide-react";

import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import { EmptyState, ErrorBox } from "../../components/common/Feedback";

import useAsync from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";

import { getStudentCourses } from "../../services/courseService";
import { getQuizzes } from "../../services/quizService";
import { getStudentResults } from "../../services/resultService";

export default function MyCourse() {
  const { user } = useAuth();

  const studentId = user?.id ?? user?.userId;

  // ===============================
  // Fetch Student Courses
  // ===============================

  const {
    data: courseData,
    loading: courseLoading,
    error: courseError,
  } = useAsync(
    () => getStudentCourses(studentId),
    [studentId]
  );

  // ===============================
  // Fetch All Quizzes
  // ===============================

  const {
    data: quizData,
    loading: quizLoading,
    error: quizError,
  } = useAsync(() => getQuizzes(), []);

  // ===============================
  // Fetch Student Quiz Results
  // ===============================

  const {
    data: resultData,
    loading: resultLoading,
    error: resultError,
  } = useAsync(
    () => getStudentResults(studentId),
    [studentId]
  );

  // ===============================
  // Loading
  // ===============================

  if (courseLoading || quizLoading || resultLoading) {
    return <Loading />;
  }

  // ===============================
  // Error Handling
  // ===============================

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

  // ===============================
  // Normalize Courses
  // ===============================

  const courses = (
    Array.isArray(courseData) ? courseData : []
  )
    .map((item) => item.subject || item)
    .filter(Boolean);

  // ===============================
  // Normalize Quizzes
  // ===============================

  const quizzes = Array.isArray(quizData)
    ? quizData
    : Array.isArray(quizData?.quizzes)
    ? quizData.quizzes
    : [];

  // ===============================
  // Normalize Results
  // ===============================

  const results = Array.isArray(resultData)
    ? resultData
    : Array.isArray(resultData?.results)
    ? resultData.results
    : [];

  // ===============================
  // Calculate Course Statistics
  // ===============================

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

  // ===============================
  // Summary Statistics
  // ===============================

  const totalCourses = courseStats.length;

  const totalQuizzes = courseStats.reduce(
    (sum, course) => sum + course.totalQuiz,
    0
  );

  const totalAttempted = courseStats.reduce(
    (sum, course) => sum + course.attemptedQuiz,
    0
  );

  // ===============================
  // UI
  // ===============================

  return (
    <div className="space-y-6">
      <PageTitle
        title="My Courses"
        subtitle="View your enrolled courses and quiz performance"
      />

      {/* ===========================
          Summary Cards
      =========================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Courses */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <BookOpen size={24} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total Courses
              </p>

              <h2 className="text-2xl font-bold text-slate-800">
                {totalCourses}
              </h2>
            </div>
          </div>
        </div>

        {/* Total Quizzes */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
              <ClipboardList size={24} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total Quizzes
              </p>

              <h2 className="text-2xl font-bold text-slate-800">
                {totalQuizzes}
              </h2>
            </div>
          </div>
        </div>

        {/* Attempted Quizzes */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-3 text-green-600">
              <GraduationCap size={24} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Attempted Quizzes
              </p>

              <h2 className="text-2xl font-bold text-slate-800">
                {totalAttempted}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* ===========================
          Course Table
      =========================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-800">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">
                    Serial
                  </th>

                  <th className="px-6 py-4">
                    Course Name
                  </th>

                  <th className="px-6 py-4">
                    Course Code
                  </th>

                  <th className="px-6 py-4 text-center">
                    Total Quiz
                  </th>

                  <th className="px-6 py-4 text-center">
                    Attempted
                  </th>

                  <th className="px-6 py-4 text-center">
                    Result Avg
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {courseStats.map((course, index) => (
                  <tr
                    key={course.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Serial */}

                    <td className="px-6 py-4 text-slate-600">
                      {index + 1}
                    </td>

                    {/* Course Name */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                          <BookOpen size={18} />
                        </div>

                        <span className="font-medium text-slate-800">
                          {course.name ||
                            course.subjectName ||
                            "Unnamed Course"}
                        </span>
                      </div>
                    </td>

                    {/* Course Code */}

                    <td className="px-6 py-4 text-slate-600">
                      {course.code ||
                        course.subjectCode ||
                        "N/A"}
                    </td>

                    {/* Total Quiz */}

                    <td className="px-6 py-4 text-center">
                      <span className="rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-700">
                        {course.totalQuiz}
                      </span>
                    </td>

                    {/* Attempted Quiz */}

                    <td className="px-6 py-4 text-center">
                      <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                        {course.attemptedQuiz}
                      </span>
                    </td>

                    {/* Average Result */}

                    <td className="px-6 py-4 text-center">
                      {course.average !== null ? (
                        <span
                          className={`rounded-full px-3 py-1 font-semibold ${
                            course.average >= 80
                              ? "bg-green-100 text-green-700"
                              : course.average >= 50
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {course.average.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
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
    </div>
  );
}