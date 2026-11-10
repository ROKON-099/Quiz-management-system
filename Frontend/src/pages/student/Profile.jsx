
import {
  Award,
  BookOpen,
  GraduationCap,
  Mail,
  UserRound,
} from "lucide-react";

import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loading from "../../components/common/Loading";
import { ErrorBox } from "../../components/common/Feedback";

import useAsync from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";

import { getAcademicRecordsPlaceholder } from "../../services/profileService";
import { fullName, userId, number } from "../../utils/format";

export default function Profile() {
  const { user } = useAuth();

  const id = user?.id || user?.userId;

  // Academic records load from profileService
  const {
    data,
    loading,
    error,
  } = useAsync(
    () => (id ? getAcademicRecordsPlaceholder(id) : Promise.resolve([])),
    [id]
  );

  // Select current academic record
  const records = Array.isArray(data) ? data : [];

  const current =
    records.find(
      (record) =>
        String(record.semester).toLowerCase() === "current"
    ) || records[0];

  const profileItems = [
    ["Student ID", userId(user), GraduationCap],
    ["Department", user?.department || "—", BookOpen],
    ["Batch", user?.batch || "—", Award],
    ["Email", user?.email || "—", Mail],
    ["Account Role", user?.role || "STUDENT", UserRound],
  ];

  return (
    <>
      <PageTitle
        title="My Profile"
        subtitle="Your personal and academic information."
      />

      <ErrorBox>{error}</ErrorBox>

      {/* Profile Information */}
      <div className="panel-card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#006045] via-[#087a5a] to-[#d0fae5]" />

        <div className="px-6 pb-7">
          <div className="-mt-12 mb-5 grid h-24 w-24 place-items-center rounded-3xl border-4 border-white bg-[#d0fae5] text-[#006045] shadow-sm">
            <UserRound size={42} />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            {fullName(user)}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {userId(user)} · Student
          </p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profileItems.map(([label, value, Icon]) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#d0fae5] text-[#006045]">
                  <Icon size={18} />
                </span>

                <div className="min-w-0">
                  <p className="text-xs text-slate-400">
                    {label}
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Academic Statistics */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {loading ? (
          <div className="sm:col-span-3">
            <Loading />
          </div>
        ) : (
          <>
            <StatCard
              label="Current CGPA"
              value={
                current?.cgpa != null
                  ? number(current.cgpa)
                  : "—"
              }
              icon={GraduationCap}
            />

            <StatCard
              label="Batch Rank"
              value={current?.batchRank ?? "—"}
              icon={Award}
            />

            <StatCard
              label="Department Rank"
              value={current?.departmentRank ?? "—"}
              icon={Award}
            />
          </>
        )}
      </div>
    </>
  );
}
