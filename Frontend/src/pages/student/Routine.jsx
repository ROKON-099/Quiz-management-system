
import {
  BookOpen,
  CalendarDays,
  Coffee,
} from "lucide-react";

const DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  
];

const OFF_DAYS = ["Saturday", "Tuesday"];

const SLOTS = [
  { label: "1st Class", time: "09:00 – 10:00 AM" },
  { label: "2nd Class", time: "10:00 – 11:00 AM" },
  { label: "3rd Class", time: "02:00 – 03:00 PM" },
  { label: "4th Class", time: "03:00 – 04:00 PM" },
];

export default function Routine({ courses = [] }) {
  const subjects = courses.slice(0, 8);

  const workingDays = DAYS.filter(
    (day) => !OFF_DAYS.includes(day)
  );

  const routine = DAYS.map((day) => {
    const isOffDay = OFF_DAYS.includes(day);
    const dayIndex = workingDays.indexOf(day);

    return {
      day,
      isOffDay,
      classes: isOffDay
        ? []
        : SLOTS.map((slot, slotIndex) => {
            const subjectIndex =
              (dayIndex * 4 + slotIndex) %
              Math.max(subjects.length, 1);

            return {
              ...slot,
              course: subjects[subjectIndex] || null,
            };
          }),
    };
  });

  // Course information
  const getCourseName = (course) =>
    course?.name ||
    course?.subjectName ||
    course?.courseName ||
    "Subject";

  const getCourseCode = (course) =>
    course?.courseCode ||
    course?.code ||
    course?.subjectCode ||
    "";

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:p-6">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CalendarDays size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              My Class Routine
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Weekly Student Class Schedule
            </p>
          </div>

        </div>

        <div className="flex flex-wrap gap-2">

          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            4 Classes / Day
          </span>

          <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
            {subjects.length} Subjects
          </span>

          <span className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
            2 Off Days
          </span>

        </div>

      </div>

      {/* Desktop Routine */}
      <div className="hidden overflow-x-auto md:block">

        <table className="w-full min-w-[950px] table-fixed border-collapse text-center">

          <thead>
            <tr className="bg-emerald-800 text-white">

              <th className="w-[13%] border border-emerald-700 px-3 py-4 text-sm">
                Day
              </th>

              {SLOTS.map((slot) => (
                <th
                  key={slot.label}
                  className="border border-emerald-700 px-3 py-4"
                >
                  <p className="text-sm font-semibold">
                    {slot.label}
                  </p>

                  <p className="mt-1 text-xs font-normal text-emerald-100">
                    {slot.time}
                  </p>
                </th>
              ))}

            </tr>
          </thead>

          <tbody>
            {routine.map((day) => (

              <tr key={day.day}>

                <td className="border border-slate-200 px-3 py-4 font-semibold text-slate-800">
                  {day.day}
                </td>

                {day.isOffDay ? (

                  <td
                    colSpan={4}
                    className="border border-slate-200 bg-slate-50 py-7"
                  >
                    <span className="text-sm font-bold tracking-widest text-gray-700">
                     OFF DAY
                    </span>
                  </td>

                ) : (

                  day.classes.map((session, index) => (

                    <td
                      key={index}
                      className="border border-slate-200 px-3 py-4"
                    >

                      <div className="flex min-h-[105px] flex-col items-center justify-center">

                        <BookOpen
                          size={19}
                          className="mb-2 text-emerald-700"
                        />

                        <p className="text-sm font-semibold text-slate-800">
                          {getCourseName(session.course)}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-emerald-700">
                          {getCourseCode(session.course)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {session.label}
                        </p>

                      </div>

                    </td>

                  ))

                )}

              </tr>

            ))}
          </tbody>

        </table>

      </div>

      {/* Mobile Routine */}
      <div className="divide-y divide-slate-200 md:hidden">

        {routine.map((day) => (

          <div key={day.day}>

            <div className="bg-emerald-800 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">
                {day.day}
              </h3>
            </div>

            {day.isOffDay ? (

              <div className="flex min-h-[65px] items-center justify-center bg-orange-50">

                <span className="text-sm font-bold tracking-widest text-orange-600">
                  WEEKLY HOLIDAY
                </span>

              </div>

            ) : (

              <div className="divide-y divide-slate-100">

                {day.classes.map((session, index) => (

                  <div
                    key={index}
                    className="flex items-center gap-3 px-4 py-4"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <BookOpen size={19} />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-semibold text-slate-800">
                        {getCourseName(session.course)}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-emerald-700">
                        {getCourseCode(session.course)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {session.label} · {session.time}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        ))}

      </div>

      {/* Break */}
      <div className="flex items-center justify-center gap-3 border-t border-slate-200 px-5 py-5">

        <Coffee size={20} className="text-emerald-700" />

        <div className="text-center">

          <p className="text-sm font-semibold text-slate-800">
            Lunch & Break Time
          </p>

          <p className="mt-1 text-xs text-slate-500">
            12:00 PM – 02:00 PM
          </p>

        </div>

      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">

        <span className="text-xs text-slate-500">
          Weekly Student Class Schedule
        </span>

        <span className="text-xs font-semibold text-emerald-700">
          5 Working Days · 2 Off Days
        </span>

      </div>

    </section>
  );
}
