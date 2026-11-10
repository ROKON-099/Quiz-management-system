
import { useState } from "react";
import {
  Bell,
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
  X,
  Clock,
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

  return (
    <div className="min-h-screen space-y-6 bg-[#f8fdf9] pb-8">

      {/* Page Header */}
      <PageTitle
        title="Notice Management"
        subtitle="Create, update and manage academic announcements."
        action={
          <button
            onClick={() => open()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#006045] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004d38]"
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
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <EmptyState
            title="No notices published"
            message="Create your first notice to inform students."
          />
        </div>
      ) : (
        <div className="space-y-4">

          {/* Notice Count */}
          <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white px-5 py-4">

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
                <Bell size={19} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Published Notices
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Manage your academic announcements
                </p>
              </div>
            </div>

            <span className="rounded-lg bg-[#d0fae5] px-3 py-2 text-xs font-bold text-[#006045]">
              {data.length} Notices
            </span>

          </div>

          {/* Notice Cards */}
          {data.map((n) => (
            <article
              key={n.id}
              className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:border-emerald-300"
            >

              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:p-6">

                {/* Icon */}
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
                  <Bell size={21} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">

                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">

                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                        {n.topic}
                      </h2>

                      <p className="mt-2 text-xs text-slate-400">
                        Published {displayDate(n.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">

                      <button
                        onClick={() => open(n)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-[#006045] transition hover:bg-[#d0fae5]"
                        aria-label="Edit notice"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        onClick={() => remove(n.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-400 hover:bg-gray-50"
                        aria-label="Delete notice"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>

                    </div>

                  </div>

                  {/* Notice Message */}
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {n.message}
                  </p>

                  {/* Quiz Schedule */}
                  {(n.quizDate || n.quizTime) && (
                    <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-emerald-100 pt-4">

                      {n.quizDate && (
                        <div className="flex items-center gap-2 text-xs text-[#006045]">
                          <CalendarDays size={15} />
                          <span>
                            {displayDate(n.quizDate)}
                          </span>
                        </div>
                      )}

                      {n.quizTime && (
                        <div className="flex items-center gap-2 text-xs text-[#006045]">
                          <Clock size={15} />
                          <span>
                            {displayTime(n.quizTime)}
                          </span>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-emerald-100 px-5 py-4 sm:px-6">

              <div className="flex items-center gap-3">

                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
                  {editing ? <Pencil size={18} /> : <Plus size={19} />}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editing ? "Edit Notice" : "Create Notice"}
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Manage your academic announcement
                  </p>
                </div>

              </div>

              <button
                onClick={() => setModal(false)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50"
              >
                <X size={19} />
              </button>

            </div>

            {/* Modal Form */}
            <form onSubmit={save} className="space-y-5 p-5 sm:p-6">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Notice Title
                </label>

                <input
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-gray-400 focus:border-[#006045] focus:ring-2 focus:ring-[#d0fae5]"
                  value={form.topic}
                  onChange={(e) =>
                    setForm({ ...form, topic: e.target.value })
                  }
                  required
                  placeholder="e.g. Upcoming quiz announcement"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Notice Message
                </label>

                <textarea
                  className="min-h-32 w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-gray-400 focus:border-[#006045] focus:ring-2 focus:ring-[#d0fae5]"
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  required
                  placeholder="Write notice details..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Quiz Date (Optional)
                  </label>

                  <input
                    type="date"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-[#006045] focus:ring-2 focus:ring-[#d0fae5]"
                    value={form.quizDate}
                    onChange={(e) =>
                      setForm({ ...form, quizDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Quiz Time (Optional)
                  </label>

                  <input
                    type="time"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-[#006045] focus:ring-2 focus:ring-[#d0fae5]"
                    value={form.quizTime}
                    onChange={(e) =>
                      setForm({ ...form, quizTime: e.target.value })
                    }
                  />
                </div>

              </div>

              <ErrorBox>{failure}</ErrorBox>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse justify-end gap-3 border-t border-emerald-100 pt-5 sm:flex-row">

                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#006045] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#004d38] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Saving..." : (
                    <>
                      <Plus size={16} />
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
