
import {
  BookOpen,
  Clock,
  Coffee,
  CalendarDays,
} from "lucide-react";

const DAYS = [
  { name: "Saturday", active: true },
  { name: "Sunday", active: false },
  { name: "Monday", active: true },
  { name: "Tuesday", active: false },
  { name: "Wednesday", active: true },
  { name: "Thursday", active: false },
];

const SLOTS = [
  { label: "1st Class", time: "09:00 – 10:00 AM" },
  { label: "2nd Class", time: "10:00 – 11:00 AM" },
  { label: "3rd Class", time: "03:00 – 04:00 PM" },
];

export default function Routine({ courses = [] }) {
  const activeDays = DAYS.filter((day) => day.active);

  const routine = DAYS.map((day) => ({
    ...day,
    classes: day.active
      ? SLOTS.map((slot, index) => ({
          ...slot,
          course: courses.length
            ? courses[
                (activeDays.findIndex((d) => d.name === day.name) * 3 +
                  index) %
                  courses.length
              ]
            : null,
        }))
      : [],
  }));

  return (
    <section className="mt-8 overflow-hidden rounded-xl border border-gray-300 bg-white">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-gray-300 p-5 sm:flex-row sm:items-center sm:p-6">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#d0fae5] text-[#006045]">
            <CalendarDays size={21} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              My Teaching Routine
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Weekly Faculty Class Schedule
            </p>
          </div>

        </div>

        <span className="w-fit rounded-lg border border-[#006045] px-4 py-2 text-xs font-semibold text-[#006045]">
          3 Working Days / Week
        </span>

      </div>

     

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">

        <table className="w-full min-w-[850px] table-fixed border-collapse text-center">

          <thead>
            <tr className="bg-[#006045] text-white">

              <th className="w-[15%] border border-[#006045] px-4 py-4 text-sm font-semibold">
                Day
              </th>

              {SLOTS.map((slot) => (
                <th
                  key={slot.label}
                  className="border border-[#006045] px-3 py-4"
                >
                  <p className="text-sm font-semibold">
                    {slot.label}
                  </p>

                  <p className="mt-1 text-xs font-normal text-white">
                    {slot.time}
                  </p>
                </th>
              ))}

            </tr>
          </thead>

          <tbody>

            {routine.map((day) => (

              <tr key={day.name}>

                {/* Day */}
                <td className="border border-gray-300 px-4 py-5">
                  <span className="text-sm font-semibold text-gray-800">
                    {day.name}
                  </span>
                </td>

                {/* Active Days */}
                {day.active ? (

                  day.classes.map((session, index) => (

                    <td
                      key={index}
                      className="border border-gray-300 px-3 py-4"
                    >

                      <div className="flex min-h-[100px] flex-col items-center justify-center">

                        <BookOpen
                          size={18}
                          className="mb-2 text-[#006045]"
                        />

                        <p className="text-sm font-semibold text-gray-800">
                          {session.course?.name ||
                            session.course?.subjectName ||
                            session.course?.courseName ||
                            "Course"}
                        </p>

                        <p className="mt-1 text-xs font-medium text-[#006045]">
                          {session.course?.courseCode ||
                            session.course?.code ||
                            ""}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {session.course?.batch
                            ? `${session.course.batch} Batch`
                            : "Teaching Class"}
                        </p>

                      </div>

                    </td>

                  ))

                ) : (

                  /* Off Day */
                  <td
                    colSpan={3}
                    className="border border-gray-300 px-4 py-6"
                  >
                    <span className="text-sm font-bold tracking-widest text-[#006045]">
                      OFF DAY
                    </span>
                  </td>

                )}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Mobile Responsive Layout */}
      <div className="divide-y divide-gray-300 md:hidden">

        {routine.map((day) => (

          <div key={day.name}>

            {/* Day Header */}
            <div className="border-b border-gray-300 bg-[#006045] px-4 py-3">
              <h3 className="text-sm font-semibold text-white">
                {day.name}
              </h3>
            </div>

            {!day.active ? (

              <div className="flex min-h-[65px] items-center justify-center">
                <span className="text-sm font-bold tracking-widest text-[#006045]">
                  OFF DAY
                </span>
              </div>

            ) : (

              <div className="divide-y divide-gray-300">

                {day.classes.map((session, index) => (

                  <div
                    key={index}
                    className="flex items-center gap-3 px-4 py-4"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#006045] text-[#006045]">
                      <BookOpen size={18} />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-semibold text-gray-800">
                        {session.course?.name ||
                          session.course?.subjectName ||
                          session.course?.courseName ||
                          "Course"}
                      </p>

                      <p className="mt-1 text-xs text-[#006045]">
                        {session.label}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {session.time}
                      </p>

                    </div>

                    <span className="shrink-0 text-xs text-gray-500">
                      {session.course?.courseCode ||
                        session.course?.code ||
                        ""}
                    </span>

                  </div>

                ))}

              </div>

            )}

          </div>

        ))}

      </div>

      {/* Tiffin Break */}
      <div className="flex items-center justify-center gap-3 border-t border-gray-300 px-5 py-5">

        <Coffee size={19} className="text-[#006045]" />

        <div className="text-center">
          <p className="text-sm font-semibold text-gray-800">
            Tiffin & Lunch Break
          </p>

          <p className="mt-1 text-xs text-gray-500">
            12:00 PM – 01:45 PM
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-300 px-5 py-4">

        <span className="text-xs text-gray-500">
          Weekly Teaching Schedule
        </span>

        <span className="text-xs font-semibold text-[#006045]">
          3 Days Class · 3 Days Off
        </span>

      </div>

    </section>
  );
}
