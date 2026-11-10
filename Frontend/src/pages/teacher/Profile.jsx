
import { Building2, Mail, ShieldCheck, UserRound, BadgeCheck } from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import { useAuth } from "../../context/AuthContext";
import { fullName, userId } from "../../utils/format";

export default function Profile() {
  const { user } = useAuth();

  const rows = [
    ["Teacher ID", userId(user), BadgeCheck],
    ["Department", user?.department || "—", Building2],
    ["Email", user?.email || "—", Mail],
    ["Role", user?.role || "TEACHER", ShieldCheck],
    ["Account status", user?.status || "Active", BadgeCheck],
  ];

  return (
    <>
      <PageTitle
        title="My Profile"
        subtitle="Your teacher account information."
      />

      <div className="panel-card overflow-hidden">

        <div className="h-32 bg-gradient-to-r from-[#006045] via-[#087a5a] to-[#d0fae5]" />

        <div className="px-6 pb-8">

          <div className="-mt-12 mb-5 grid h-24 w-24 place-items-center rounded-3xl border-4 border-white bg-[#d0fae5] text-[#006045] shadow-sm">
            <UserRound size={42} />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            {fullName(user)}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Teacher account
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {rows.map(([label, value, Icon]) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
              >

                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
                  <Icon size={18} />
                </span>

                <div>
                  <p className="text-xs text-slate-400">
                    {label}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {value}
                  </p>
                </div>

              </div>
            ))}

          </div>

        </div>
      </div>
    </>
  );
}
