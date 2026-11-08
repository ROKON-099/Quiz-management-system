import { Bell, CalendarDays } from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import { EmptyState, ErrorBox } from "../../components/common/Feedback";
import useAsync from "../../hooks/useAsync";
import { getNotices } from "../../services/noticeService";
import { displayDate, displayTime } from "../../utils/format";

export default function Notice(){const {data,loading,error}=useAsync(getNotices,[]);return <><PageTitle title="Notices" subtitle="Important announcements and quiz schedules."/><ErrorBox>{error}</ErrorBox>{loading?<Loading text="Loading notices..."/>:!data?.length?<div className="panel-card"><EmptyState title="No notices available"/></div>:<div className="space-y-4">{data.map(n=><article key={n.id} className="panel-card p-5 sm:p-6"><div className="flex gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Bell size={20}/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold text-slate-900">{n.topic||n.title}</h2><span className="text-xs text-slate-400">{displayDate(n.createdAt)}</span></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{n.message}</p>{(n.quizDate||n.quizTime)&&<div className="mt-4 inline-flex flex-wrap items-center gap-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700"><CalendarDays size={15}/>{displayDate(n.quizDate)} · {displayTime(n.quizTime)}</div>}</div></div></article>)}</div>}</>}
