import { Bell, CalendarDays } from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import { EmptyState, ErrorBox } from "../../components/common/Feedback";
import useAsync from "../../hooks/useAsync";
import { getNotices } from "../../services/noticeService";
import { displayDate, displayTime } from "../../utils/format";

export default function Notice() {
  const { data, loading, error } = useAsync(getNotices, []);

  return (
    <div className="min-h-screen space-y-6 bg-[#f8fdf9] pb-8">

      <PageTitle
        title="Notices"
        subtitle="Important announcements and quiz schedules."
      />

      <ErrorBox>{error}</ErrorBox>

      {loading ? (
        <Loading text="Loading notices..." />
      ) : !data?.length ? (
        <div className="rounded-2xl border border-emerald-200 bg-white p-6">
          <EmptyState title="No notices available" />
        </div>
      ) : (
        <div className="space-y-4">

          {data.map((n) => (
            <article
              key={n.id}
              className="overflow-hidden rounded-2xl border border-emerald-200 bg-white"
            >

              <div className="flex gap-4 border-b border-emerald-100 bg-[#f0faf4] p-5 sm:p-6">

                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
                  <Bell size={21} />
                </span>

                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center justify-between gap-2">

                    <h2 className="text-base font-bold text-emerald-950">
                      {n.topic || n.title}
                    </h2>

                    <span className="text-xs font-medium text-slate-500">
                      {displayDate(n.createdAt)}
                    </span>

                  </div>

                </div>

              </div>

              <div className="p-5 sm:p-6">

                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {n.message}
                </p>

                {(n.quizDate || n.quizTime) && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-emerald-100 pt-4">

                    <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-[#f0faf4] px-3 py-2 text-xs font-semibold text-[#006045]">
                      <CalendarDays size={15} />
                      {displayDate(n.quizDate)}
                    </span>

                    <span className="text-xs font-semibold text-[#006045]">
                      {displayTime(n.quizTime)}
                    </span>

                  </div>
                )}

              </div>

            </article>
          ))}

        </div>
      )}

    </div>
  );
}