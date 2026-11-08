import { LoaderCircle } from "lucide-react";
export default function Loading({ text = "Loading..." }) {
  return <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-slate-500"><LoaderCircle className="animate-spin text-indigo-600" size={28}/><span className="text-sm">{text}</span></div>;
}
