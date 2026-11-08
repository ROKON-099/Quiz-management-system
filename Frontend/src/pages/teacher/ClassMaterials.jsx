import { useState } from "react";
import {
  BookOpen,
  Upload,
  Plus,
  Download,
  Trash2,
  FileText,
  CalendarDays,
  X,
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
import api from "../../services/api";
import { displayDate } from "../../utils/format";

const initialForm = {
  title: "",
  description: "",
  subjectId: "",
  file: null,
};

export default function ClassNotes() {
  const { user } = useAuth();
  const teacherId = user?.id || user?.userId;

  const {
    data,
    loading,
    error,
    refetch,
  } = useAsync(
    async () => {
      if (!teacherId) return [];
      const response = await api.get(
        `/class-notes/teacher/${teacherId}`
      );
      return response.data;
    },
    [teacherId]
  );

  const [form, setForm] = useState(initialForm);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [failure, setFailure] = useState("");
  const [message, setMessage] = useState("");

  function openModal() {
    setForm(initialForm);
    setFailure("");
    setModal(true);
  }

  async function uploadNote(e) {
    e.preventDefault();

    if (!form.file) {
      setFailure("Please select a class notes file.");
      return;
    }

    try {
      setBusy(true);
      setFailure("");
      setMessage("");

      const payload = new FormData();

      payload.append("teacherId", teacherId);
      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());

      if (form.subjectId) {
        payload.append("subjectId", form.subjectId);
      }

      payload.append("file", form.file);

      await api.post("/class-notes", payload);

      setModal(false);
      setForm(initialForm);
      setMessage("Class notes uploaded successfully.");

      await refetch();
    } catch (err) {
      setFailure(
        err.response?.data?.message ||
        err.message ||
        "Unable to upload class notes."
      );
    } finally {
      setBusy(false);
    }
  }

  async function downloadNote(note) {
    try {
      setDownloading(note.id);
      setFailure("");

      const response = await api.get(
        `/class-notes/${note.id}/download`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");
      link.href = url;
      link.download =
        note.fileName || note.title || "class-notes";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setFailure(
        err.response?.data?.message ||
        "Unable to download this file."
      );
    } finally {
      setDownloading(null);
    }
  }

  async function deleteNote(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this class note?"
    );

    if (!confirmed) return;

    try {
      setFailure("");
      setMessage("");

      await api.delete(`/class-notes/${id}`);

      setMessage("Class notes deleted successfully.");
      await refetch();
    } catch (err) {
      setFailure(
        err.response?.data?.message ||
        "Unable to delete class notes."
      );
    }
  }

  return (
    <>
      <PageTitle
        title="Class Notes Management"
        subtitle="Upload and manage study materials for your students."
        action={
          <button
            onClick={openModal}
            className="btn-primary"
          >
            <Plus size={17} />
            Upload Class Notes
          </button>
        }
      />

      <ErrorBox>{error || failure}</ErrorBox>
      <SuccessBox>{message}</SuccessBox>

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <BookOpen size={21} />
            </span>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Total Uploaded Notes
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {data?.length ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <FileText size={21} />
            </span>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Study Materials
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {data?.length ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes List */}
      {loading ? (
        <Loading text="Loading class notes..." />
      ) : !data?.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <EmptyState
            title="No class notes uploaded"
            message="Upload your first study material to share it with students."
          />

          <div className="mt-4 flex justify-center">
            <button
              onClick={openModal}
              className="btn-primary"
            >
              <Upload size={17} />
              Upload First Note
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold text-slate-800">
                Uploaded Class Notes
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Manage your published study materials.
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              {data.length} Files
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">

              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">SL</th>
                  <th className="px-5 py-4">Class Notes</th>
                  <th className="px-5 py-4">Uploaded Date</th>
                  <th className="px-5 py-4">File</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.map((note, index) => (
                  <tr
                    key={note.id}
                    className="transition hover:bg-emerald-50/40"
                  >
                    <td className="px-5 py-4 text-slate-400">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                          <FileText size={19} />
                        </span>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {note.title}
                          </p>

                          <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                            {note.description || "Study material"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      <span className="flex items-center gap-2">
                        <CalendarDays
                          size={15}
                          className="text-emerald-600"
                        />
                        {note.createdAt
                          ? displayDate(note.createdAt)
                          : "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                        {note.fileName || "Attachment"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() => downloadNote(note)}
                          disabled={downloading === note.id}
                          className="icon-button text-emerald-700"
                          title="Download"
                        >
                          <Download size={17} />
                        </button>

                        <button
                          onClick={() => deleteNote(note.id)}
                          className="icon-button text-rose-600"
                          title="Delete"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="my-auto w-full max-w-xl rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Upload Class Notes
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Share study materials with your students.
                </p>
              </div>

              <button
                onClick={() => setModal(false)}
                className="icon-button"
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={uploadNote}
              className="space-y-4"
            >

              <div>
                <label className="field-label">
                  Notes Title
                </label>

                <input
                  type="text"
                  className="field-input standalone"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Digital Logic - Chapter 01"
                  required
                />
              </div>

              <div>
                <label className="field-label">
                  Description
                </label>

                <textarea
                  className="field-input standalone min-h-24"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  placeholder="Write a short description..."
                />
              </div>

              <div>
                <label className="field-label">
                  Subject ID (optional)
                </label>

                <input
                  type="number"
                  min="1"
                  className="field-input standalone"
                  value={form.subjectId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      subjectId: e.target.value,
                    })
                  }
                  placeholder="Enter subject ID"
                />
              </div>

              <div>
                <label className="field-label">
                  Select Notes File
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-5 transition hover:border-emerald-400 hover:bg-emerald-50">

                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm">
                    <Upload size={21} />
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-700">
                      {form.file
                        ? form.file.name
                        : "Choose a file to upload"}
                    </span>

                    <span className="mt-1 block text-xs text-slate-400">
                      PDF, DOC, DOCX or PPT files
                    </span>
                  </span>

                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        file: e.target.files?.[0] || null,
                      })
                    }
                    required
                  />
                </label>
              </div>

              <ErrorBox>{failure}</ErrorBox>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary"
                >
                  <Upload size={16} />
                  {busy ? "Uploading..." : "Upload Notes"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}