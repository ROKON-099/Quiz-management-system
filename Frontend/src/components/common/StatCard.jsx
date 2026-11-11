export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "emerald",
}) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <p className="text-xs font-semibold tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-[27px] font-extrabold tracking-tight text-[#006045]">
            {value ?? "—"}
          </p>

          {hint && (
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {hint}
            </p>
          )}

        </div>

        {Icon && (
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
            <Icon size={22} strokeWidth={2} />
          </span>
        )}

      </div>

    </div>
  );
}