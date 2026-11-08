import { Layers3 } from "lucide-react";
import { Link } from "react-router-dom";
export default function Brand({ light = false }) {
  return (
    <Link to="/" className="inline-flex items-center gap-3">
      <span
        className={`grid h-11 w-11 place-items-center rounded-xl ${light ? "bg-white/15 border border-white/20" : "bg-indigo-600 text-white"}`}
      >
        <Layers3 size={22} />
      </span>
      <span>
        <span
          className={`block text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-slate-900"}`}
        >
          QuizRank
        </span>
        <span
          className={`block text-[11px] ${light ? "text-indigo-100" : "text-slate-500"}`}
        >
          Department Quiz Platform
        </span>
      </span>
    </Link>
  );
}
