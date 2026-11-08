export const fullName = (user) => user?.name || user?.fullName || "User";
export const userId = (user) => user?.userId || user?.studentId || user?.id || "";
export const displayDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};
export const displayTime = (value) => value ? String(value).slice(0, 5) : "—";
export const asArray = (value) => Array.isArray(value) ? value : [];
export const number = (value, digits = 2) => Number(value || 0).toFixed(digits);
export const getError = (error) => error?.message || "Something went wrong.";
