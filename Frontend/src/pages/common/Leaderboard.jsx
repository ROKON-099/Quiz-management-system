
import { useMemo, useState } from "react";
import {
  Award,
  Trophy,
  Users,
  Search,
  GraduationCap,
  ClipboardList,
} from "lucide-react";

import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loading from "../../components/common/Loading";
import {
  EmptyState,
  ErrorBox,
} from "../../components/common/Feedback";

import useAsync from "../../hooks/useAsync";

import { getDepartmentLeaderboard } from "../../services/leaderboardService";
import { getStudentResults } from "../../services/resultService";

import { number } from "../../utils/format";

export default function Leaderboard() {
  const [query, setQuery] = useState("");
  const [sortType, setSortType] = useState("cgpa");

  // Load CGPA leaderboard
  const {
    data,
    loading,
    error,
  } = useAsync(getDepartmentLeaderboard, []);

  const students = Array.isArray(data) ? data : [];

  // Load each student's quiz results
  const {
    data: quizRankingData,
    loading: quizLoading,
    error: quizError,
  } = useAsync(
    async () => {
      if (!students.length) return [];

      const results = await Promise.all(
        students.map(async (student) => {
          const studentId =
            student.studentId ??
            student.id;

          if (!studentId) {
            return {
              ...student,
              totalQuizMarks: 0,
              attemptedQuizzes: 0,
            };
          }

          try {
            const response = await getStudentResults(studentId);

            const studentResults = Array.isArray(response)
              ? response
              : Array.isArray(response?.results)
                ? response.results
                : [];

            const validResults = studentResults.filter(
              (result) => {
                const marks =
                  result.marksObtained ??
                  result.obtainedMarks ??
                  result.score ??
                  result.marks;

                return (
                  marks !== null &&
                  marks !== undefined &&
                  Number.isFinite(Number(marks))
                );
              }
            );

            const totalMarks = validResults.reduce(
              (sum, result) => {
                const marks =
                  result.marksObtained ??
                  result.obtainedMarks ??
                  result.score ??
                  result.marks;

                return sum + Number(marks);
              },
              0
            );

            return {
              ...student,
              totalQuizMarks: totalMarks,
              attemptedQuizzes: validResults.length,
            };
          } catch {
            return {
              ...student,
              totalQuizMarks: 0,
              attemptedQuizzes: 0,
            };
          }
        })
      );

      return results;
    },
    [students]
  );

  // Select ranking data
  const rankingData =
    sortType === "cgpa"
      ? students
      : Array.isArray(quizRankingData)
        ? quizRankingData
        : [];

  // Sort and search
  const rows = useMemo(() => {
    const filtered = rankingData.filter((student) =>
      `${student.name || ""} ${student.userId || ""} ${student.batch || ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (sortType === "cgpa") {
        return Number(b.cgpa || 0) - Number(a.cgpa || 0);
      }

      return (
        Number(b.totalQuizMarks || 0) -
        Number(a.totalQuizMarks || 0)
      );
    });
  }, [rankingData, query, sortType]);

  const top = rows[0];

  const isLoading =
    sortType === "cgpa"
      ? loading
      : loading || quizLoading;

  const currentError =
    sortType === "cgpa"
      ? error
      : error || quizError;

  return (
    <div className="space-y-6">

      <PageTitle
        title="Leaderboard"
        subtitle="Student academic and quiz performance ranking."
      />

      <ErrorBox>{currentError}</ErrorBox>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        <StatCard
          label="Ranked Students"
          value={students.length}
          icon={Users}
        />

        <StatCard
          label={
            sortType === "cgpa"
              ? "Top CGPA"
              : "Highest Quiz Marks"
          }
          value={
            top
              ? sortType === "cgpa"
                ? number(top.cgpa)
                : top.totalQuizMarks
              : "—"
          }
          icon={Trophy}
        />

        <StatCard
          label="Top Student"
          value={top?.name || "—"}
          hint={top?.userId || ""}
          icon={Award}
        />

      </div>

      {/* Ranking Table */}
      <section className="overflow-hidden rounded-2xl border border-[#cfe6d9] bg-white shadow-sm">

        {/* Heading */}
        <div className="flex flex-col gap-4 border-b border-[#dceee5] bg-[#f2fbf6] p-5">

          <div>
            <h2 className="text-lg font-bold text-[#006045]">
              Department Ranking
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Choose ranking method to compare student performance.
            </p>
          </div>

          {/* Ranking Options */}
          <div className="flex flex-wrap gap-2">

            <button
              onClick={() => setSortType("cgpa")}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                sortType === "cgpa"
                  ? "border-[#006045] bg-[#006045] text-white"
                  : "border-[#cfe6d9] bg-white text-[#006045]"
              }`}
            >
              <GraduationCap size={17} />
              CGPA Ranking
            </button>

            <button
              onClick={() => setSortType("quiz")}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                sortType === "quiz"
                  ? "border-[#006045] bg-[#006045] text-white"
                  : "border-[#cfe6d9] bg-white text-[#006045]"
              }`}
            >
              <ClipboardList size={17} />
              Quiz Marks Ranking
            </button>

          </div>

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#006045]"
            />

            <input
              type="text"
              className="w-full rounded-xl border border-[#cfe6d9] bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#006045] focus:ring-2 focus:ring-[#d0fae5]"
              placeholder="Search student or batch..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-6">
            <Loading text="Loading ranking..." />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No ranking found"
              message="No students found matching your search."
            />
          </div>
        ) : (
          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[750px] border-collapse text-left text-sm">

              <thead className="bg-[#006045] text-white">
                <tr>
                  <th className="whitespace-nowrap border border-[#ffffff30] px-5 py-4">
                    Rank
                  </th>

                  <th className="whitespace-nowrap border border-[#ffffff30] px-5 py-4">
                    Student
                  </th>

                  <th className="whitespace-nowrap border border-[#ffffff30] px-5 py-4">
                    Student ID
                  </th>

                  <th className="whitespace-nowrap border border-[#ffffff30] px-5 py-4">
                    Batch
                  </th>

                  {sortType === "cgpa" ? (
                    <>
                      <th className="whitespace-nowrap border border-[#ffffff30] px-5 py-4 text-center">
                        CGPA
                      </th>

                      <th className="whitespace-nowrap border border-[#ffffff30] px-5 py-4 text-center">
                        Department Rank
                      </th>

                      <th className="whitespace-nowrap border border-[#ffffff30] px-5 py-4 text-center">
                        Batch Rank
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="whitespace-nowrap border border-[#ffffff30] px-5 py-4 text-center">
                        Attempted Quizzes
                      </th>

                      <th className="whitespace-nowrap border border-[#ffffff30] px-5 py-4 text-center">
                        Total Quiz Marks
                      </th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="bg-[#f8fdf9]">

                {rows.map((student, index) => (
                  <tr
                    key={`${student.studentId}-${index}`}
                    className="border-b border-[#dceee5] last:border-b-0"
                  >

                    {/* Rank */}
                    <td className="whitespace-nowrap border border-[#dceee5] px-5 py-4">
                      <span
                        className={`inline-grid h-9 w-9 place-items-center rounded-lg font-bold ${
                          index === 0
                            ? "border border-[#9bd7b5] bg-[#d0fae5] text-[#006045]"
                            : index === 1
                              ? "border border-slate-200 bg-white text-slate-700"
                              : index === 2
                                ? "border border-[#cfe6d9] bg-[#edf8f1] text-[#006045]"
                                : "bg-white text-slate-600"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>

                    {/* Student */}
                    <td className="whitespace-nowrap border border-[#dceee5] px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d0fae5] text-[#006045]">
                          <Users size={17} />
                        </div>

                        <span className="font-semibold text-slate-800">
                          {student.name || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="whitespace-nowrap border border-[#dceee5] px-5 py-4 font-medium text-slate-600">
                      {student.userId || student.studentId}
                    </td>

                    {/* Batch */}
                    <td className="whitespace-nowrap border border-[#dceee5] px-5 py-4">
                      <span className="inline-flex rounded-lg border border-[#c6e9d5] bg-[#e9f9ef] px-3 py-1.5 text-xs font-bold text-[#006045]">
                        {student.batch || "—"}
                      </span>
                    </td>

                    {sortType === "cgpa" ? (
                      <>
                        <td className="whitespace-nowrap border border-[#dceee5] px-5 py-4 text-center">
                          <span className="rounded-lg border border-[#c6e9d5] bg-[#e9f9ef] px-3 py-1.5 font-bold text-[#006045]">
                            {number(student.cgpa)}
                          </span>
                        </td>

                        <td className="border border-[#dceee5] px-5 py-4 text-center font-semibold text-slate-700">
                          {student.departmentRank ?? "—"}
                        </td>

                        <td className="border border-[#dceee5] px-5 py-4 text-center font-semibold text-[#006045]">
                          {student.batchRank ?? "—"}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border border-[#dceee5] px-5 py-4 text-center font-semibold text-slate-700">
                          {student.attemptedQuizzes}
                        </td>

                        <td className="border border-[#dceee5] px-5 py-4 text-center">
                          <span className="inline-flex rounded-lg border border-[#c6e9d5] bg-[#e9f9ef] px-3 py-1.5 font-bold text-[#006045]">
                            {student.totalQuizMarks}
                          </span>
                        </td>
                      </>
                    )}

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
