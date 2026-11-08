export default function PageTitle({ title, subtitle, action }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>{subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}</div>{action}</div>;
}
