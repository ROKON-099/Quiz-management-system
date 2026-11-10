import { CalendarDays } from "lucide-react";
export default function PageTitle({ title, subtitle, action }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-indigo-500">
          <CalendarDays size={13} /> QuizRank workspace
        </div>
        <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-[32px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
