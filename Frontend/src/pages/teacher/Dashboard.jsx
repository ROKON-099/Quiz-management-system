import { BookOpen, Bell, ClipboardList, Users, Plus, ArrowUpRight, GraduationCap, Hash } from "lucide-react";
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
  const mine = (quizzes.data || []).filter((quiz) => Number(quiz.createdBy) === Number(id) || Number(quiz.teacherId) === Number(id));
  const courseList = courses.data || [];

  return (
    <>
      <PageTitle
        title={`Welcome, ${fullName(user)}`}
        subtitle="Your academic workspace at a glance. Manage assigned courses, assessments and student progress."
        action={<Link to="/teacher/create-quiz" className="btn-primary"><Plus size={17} /> Create Quiz</Link>}
      />
      <ErrorBox>{courses.error || notices.error || quizzes.error}</ErrorBox>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned Courses" value={courses.loading ? "…" : courseList.length} icon={BookOpen} />
        <StatCard label="My Quizzes" value={quizzes.loading ? "…" : mine.length} icon={ClipboardList} tone="emerald" />
        <StatCard label="Notices Published" value={notices.loading ? "…" : notices.data?.length || 0} icon={Bell} tone="amber" />
        <StatCard label="Teaching Workspace" value="Active" hint="Faculty account" icon={GraduationCap} tone="violet" />
      </div>

      <section className="panel-card mt-7 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-50 p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><BookOpen size={18} /></span><h2 className="text-lg font-bold text-slate-900">Assigned Courses</h2></div>
            <p className="mt-2 text-sm text-slate-500">Your teaching courses, listed in sequence.</p>
          </div>
          <Link to="/teacher/my-course" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-900">View all courses <ArrowUpRight size={15} /></Link>
        </div>
        {courses.loading ? <Loading /> : !courseList.length ? (
          <div className="p-6"><EmptyState title="No courses assigned" description="Courses assigned to your faculty account will appear here." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[680px]">
              <thead><tr><th className="w-20">SL</th><th>Course</th><th>Course Code</th><th>Batch</th><th className="text-right">Action</th></tr></thead>
              <tbody>
                {courseList.map((course, index) => (
                  <tr key={course.id ?? course.subjectId ?? index}>
                    <td><span className="inline-grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700">{String(index + 1).padStart(2, "0")}</span></td>
                    <td><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-emerald-700"><BookOpen size={17} /></span><div><p className="font-semibold text-slate-800">{course.name || course.subjectName || course.courseName || "Untitled course"}</p><p className="mt-0.5 text-xs text-slate-400">{course.batch ? `${course.batch} batch` : "Assigned course"}</p></div></div></td>
                    <td><span className="rounded-lg bg-slate-50 px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-600">{course.courseCode || course.code || "—"}</span></td>
                    <td className="text-slate-600">{course.batch || "—"}</td>
                    <td className="text-right"><Link to="/teacher/create-quiz" state={{ subjectId: course.id || course.subjectId }} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"><Plus size={14} /> Create quiz</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-slate-100 bg-[#fbfefc] px-5 py-3 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><Hash size={13} /> Course sequence</span><span>{courseList.length} assigned {courseList.length === 1 ? "course" : "courses"}</span></div>
      </section>

      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <section className="panel-card overflow-hidden">
          <div className="border-b border-emerald-50 p-5"><h2 className="font-semibold text-slate-900">Quick Actions</h2><p className="mt-1 text-xs text-slate-500">Common faculty tasks</p></div>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <Link to="/teacher/create-quiz" className="action-card"><ClipboardList size={22} /><span><b>Create a quiz</b><small>Prepare a course assessment</small></span><ArrowUpRight size={17} /></Link>
            <Link to="/teacher/notice" className="action-card"><Bell size={22} /><span><b>Manage notices</b><small>Publish course announcements</small></span><ArrowUpRight size={17} /></Link>
            <Link to="/teacher/results" className="action-card"><Users size={22} /><span><b>Student results</b><small>Review quiz performance</small></span><ArrowUpRight size={17} /></Link>
            <Link to="/teacher/my-course" className="action-card"><BookOpen size={22} /><span><b>My courses</b><small>View assigned courses</small></span><ArrowUpRight size={17} /></Link>
          </div>
        </section>
        <section className="panel-card p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ClipboardList size={18} /></span><h2 className="font-semibold text-slate-900">Assessment Overview</h2></div>
          <p className="text-sm leading-6 text-slate-500">Create quizzes for your assigned courses and review submissions from the Student Results workspace. Each quiz and its results remain associated with the course where it was created.</p>
          <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/70 p-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Quizzes created by you</p><p className="mt-1 text-2xl font-bold text-emerald-900">{quizzes.loading ? "—" : mine.length}</p></div><Link to="/teacher/results" className="btn-secondary btn-sm">View results <ArrowUpRight size={14} /></Link></div>
        </section>
      </div>
    </>
  );
}
