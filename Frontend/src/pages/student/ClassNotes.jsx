import { BookOpen, Download, FileText } from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import { useAuth } from "../../context/AuthContext";
import useAsync from "../../hooks/useAsync";
import Loading from "../../components/common/Loading";
import { EmptyState, ErrorBox } from "../../components/common/Feedback";
import {
  getClassNotes,
  downloadLearningFile,
} from "../../services/learningService";
import { displayDate } from "../../utils/format";
export default function ClassNotes() {
  const { user } = useAuth();
  const id = user?.id ?? user?.userId;
  const { data, loading, error } = useAsync(
    () => getClassNotes("STUDENT", id),
    [id],
  );
  return (
    <div className="space-y-5">
      <PageTitle
        title="Class Notes"
        subtitle="Download lecture notes shared by your teachers."
      />
      <ErrorBox>{error}</ErrorBox>
      {loading ? (
        <Loading />
      ) : !data?.length ? (
        <div className="panel-card">
          <EmptyState
            title="No class notes available"
            message="Your teachers have not published notes for your courses yet."
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((n) => (
            <article key={n.id} className="panel-card p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <BookOpen />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-slate-900">{n.title}</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Published {displayDate(n.createdAt)}
                  </p>
                </div>
              </div>
              {n.description && (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {n.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="flex min-w-0 items-center gap-2 truncate text-xs text-slate-500">
                  <FileText size={15} />
                  {n.fileName}
                </span>
                <button
                  onClick={() =>
                    downloadLearningFile(
                      `/class-notes/${n.id}/download`,
                      n.fileName,
                    )
                  }
                  className="btn-primary"
                >
                  <Download size={15} /> Download
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
