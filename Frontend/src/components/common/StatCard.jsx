export default function StatCard({ label, value, hint, icon: Icon, tone = "indigo" }) {
  const tones = { indigo: "bg-indigo-50 text-indigo-600", violet: "bg-violet-50 text-violet-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", sky: "bg-sky-50 text-sky-600" };
  return <div className="panel-card p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value ?? "—"}</p>{hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}</div>{Icon && <span className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone] || tones.indigo}`}><Icon size={21}/></span>}</div></div>;
}
