
import { useState } from "react";

import {
  Bell,
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
  X,
  Clock,
  FileText,
  Megaphone,
  CheckCircle2,
} from "lucide-react";

import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";

import {
  EmptyState,
  ErrorBox,
  SuccessBox,
} from "../../components/common/Feedback";

import useAsync from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";

import {
  createNotice,
  deleteNotice,
  getTeacherNotices,
  updateNotice,
} from "../../services/noticeService";

import { displayDate, displayTime } from "../../utils/format";

const blank = {
  topic: "",
  message: "",
  quizDate: "",
  quizTime: "",
  subjectId: "",
};

export default function Notice() {
  const { user } = useAuth();

  const teacherId = user?.id || user?.userId;

  const { data, loading, error, refetch } = useAsync(
    () => getTeacherNotices(teacherId),
    [teacherId]
  );

  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");

  function open(n) {
    setEditing(n?.id || null);

    setForm(
      n
        ? {
            topic: n.topic || "",
            message: n.message || "",
            quizDate: n.quizDate || "",
            quizTime: n.quizTime || "",
            subjectId: n.subjectId || "",
          }
        : blank
    );

    setModal(true);
    setFailure("");
  }

  async function save(e) {
    e.preventDefault();

    setBusy(true);
    setFailure("");
    setMessage("");

    try {
      const payload = {
        ...form,
        teacherId: Number(teacherId),
        subjectId: form.subjectId ? Number(form.subjectId) : null,
        quizDate: form.quizDate || null,
        quizTime: form.quizTime || null,
      };

      if (editing) await updateNotice(editing, payload);
      else await createNotice(payload);

      setModal(false);

      setMessage(
        editing
          ? "Notice updated successfully."
          : "Notice published successfully."
      );

      await refetch();

    } catch (err) {
      setFailure(err.message);

    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this notice?")) return;

    try {
      await deleteNotice(id);
      setMessage("Notice deleted.");
      refetch();

    } catch (e) {
      setFailure(e.message);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#006045] focus:ring-2 focus:ring-emerald-100";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <div className="min-h-screen space-y-7 bg-[#f8fdf9] pb-8">

      {/* Page Header */}
      <PageTitle
        title="Notice Management"
        subtitle="Create, update and manage academic announcements."
        action={
          <button
            onClick={() => open()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#006045] px-5 py-3 text-sm font-semibold text-white"
          >
            <Plus size={17} />
            Create Notice
          </button>
        }
      />

      {/* Feedback */}
      <ErrorBox>{error || failure}</ErrorBox>
      <SuccessBox>{message}</SuccessBox>

      {/* Notice List */}
      {loading ? (
        <Loading />
      ) : !data?.length ? (

        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white">

          <div className="flex items-center gap-3 border-b border-emerald-100 bg-[#f0faf4] p-5 sm:p-6">

            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
              <Bell size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-emerald-950">
                Published Notices
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage your academic announcements
              </p>
            </div>

          </div>

          <div className="p-6">
            <EmptyState
              title="No notices published"
              message="Create your first notice to inform students."
            />
          </div>

        </div>

      ) : (

        <div className="space-y-5">

          {/* Notice Section */}
          <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">

            {/* Section Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100 bg-[#f0faf4] p-5 sm:p-6">

              <div className="flex items-center gap-3">

                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
                  <Bell size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-emerald-950">
                    Published Notices
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage your academic announcements
                  </p>
                </div>

              </div>

              <span className="rounded-full bg-[#d0fae5] px-4 py-2 text-sm font-bold text-[#006045]">
                {data.length} Notices
              </span>

            </div>

            {/* Notice Cards */}
            <div className="space-y-4 bg-[#f8fdf9] p-4 sm:p-5">

              {data.map((n, index) => (

                <article
                  key={n.id}
                  className="overflow-hidden rounded-2xl border border-emerald-200 bg-white"
                >

                  {/* Notice Card Header */}
                  <div className="flex flex-col gap-4 border-b border-emerald-100 bg-[#f0faf4] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
                        <Megaphone size={22} />
                      </div>

                      <div className="min-w-0">

                        <h3 className="break-words text-base font-bold text-emerald-950 sm:text-lg">
                          {n.topic}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Published {displayDate(n.createdAt)}
                        </p>

                      </div>

                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">

                      <button
                        onClick={() => open(n)}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#006045]"
                        aria-label="Edit notice"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        onClick={() => remove(n.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-600"
                        aria-label="Delete notice"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>

                    </div>

                  </div>

                  {/* Notice Content */}
                  <div className="p-5 sm:p-6">

                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-800">
                      <FileText size={15} />
                      Notice Details
                    </div>

                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                      {n.message}
                    </p>

                    {/* Quiz Schedule */}
                    {(n.quizDate || n.quizTime) && (

                      <div className="mt-5 border-t border-emerald-100 pt-5">

                        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-emerald-900">
                          Quiz Schedule
                        </p>

                        <div className="flex flex-wrap gap-3">

                          {n.quizDate && (

                            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-[#f0faf4] px-4 py-2.5 text-sm font-medium text-[#006045]">

                              <CalendarDays size={16} />

                              {displayDate(n.quizDate)}

                            </div>

                          )}

                          {n.quizTime && (

                            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-[#f0faf4] px-4 py-2.5 text-sm font-medium text-[#006045]">

                              <Clock size={16} />

                              {displayTime(n.quizTime)}

                            </div>

                          )}

                        </div>

                      </div>

                    )}

                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between border-t border-emerald-100 bg-[#f8fdf9] px-5 py-3">

                    <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <CheckCircle2 size={14} className="text-[#006045]" />
                      Published Announcement
                    </span>

                    <span className="text-xs font-semibold text-emerald-800">
                      Notice #{index + 1}
                    </span>

                  </div>

                </article>

              ))}

            </div>

            {/* List Footer */}
            <div className="flex items-center justify-between border-t border-emerald-100 bg-[#f0faf4] px-5 py-4">

              <span className="text-xs font-medium text-slate-500">
                <Bell size={14} className="mr-2 inline text-[#006045]" />
                Notice Management
              </span>

              <span className="text-xs font-bold text-[#006045]">
                {data.length} Published
              </span>

            </div>

          </section>

        </div>

      )}

      {/* Create / Edit Modal */}
      {modal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">

          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-emerald-500/30 bg-[#006045] px-5 py-5 sm:px-6">

              <div className="flex items-center gap-3">

                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
                  {editing ? (
                    <Pencil size={19} />
                  ) : (
                    <Plus size={21} />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editing ? "Edit Notice" : "Create Notice"}
                  </h2>

                  <p className="mt-1 text-xs text-emerald-100">
                    Manage your academic announcement
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => setModal(false)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/30 text-white"
                aria-label="Close modal"
              >
                <X size={19} />
              </button>

            </div>

            {/* Modal Form */}
            <form onSubmit={save} className="space-y-5 p-5 sm:p-6">

              {/* Notice Title */}
              <div>

                <label className={labelClass}>
                  <FileText size={15} className="mr-2 inline text-[#006045]" />
                  Notice Title
                </label>

                <input
                  className={inputClass}
                  value={form.topic}
                  onChange={(e) =>
                    setForm({ ...form, topic: e.target.value })
                  }
                  required
                  placeholder="e.g. Upcoming quiz announcement"
                />

              </div>

              {/* Notice Message */}
              <div>

                <label className={labelClass}>
                  <Megaphone size={15} className="mr-2 inline text-[#006045]" />
                  Notice Message
                </label>

                <textarea
                  className={`${inputClass} min-h-36 resize-y leading-6`}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  required
                  placeholder="Write notice details..."
                />

              </div>

              {/* Quiz Schedule */}
              <div className="rounded-xl border border-emerald-200 bg-[#f0faf4] p-4">

                <div className="mb-4 flex items-center gap-2">

                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#d0fae5] text-[#006045]">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">
                      Quiz Schedule
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Optional date and time
                    </p>
                  </div>

                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  {/* Quiz Date */}
                  <div>

                    <label className={labelClass}>
                      Quiz Date
                    </label>

                    <input
                      type="date"
                      className={inputClass}
                      value={form.quizDate}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          quizDate: e.target.value,
                        })
                      }
                    />

                  </div>

                  {/* Quiz Time */}
                  <div>

                    <label className={labelClass}>
                      Quiz Time
                    </label>

                    <input
                      type="time"
                      className={inputClass}
                      value={form.quizTime}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          quizTime: e.target.value,
                        })
                      }
                    />

                  </div>

                </div>

              </div>

              <ErrorBox>{failure}</ErrorBox>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse justify-end gap-3 border-t border-emerald-100 pt-5 sm:flex-row">

                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="rounded-xl border border-emerald-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>

                <button
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#006045] px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? (
                    "Saving..."
                  ) : (
                    <>
                      <Plus size={17} />
                      {editing ? "Update Notice" : "Publish Notice"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}