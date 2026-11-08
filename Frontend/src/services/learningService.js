import api from "./api";

// Backend baseURL already ends with /api.
export const getAssignments = async (role, id) =>
  (
    await api.get(
      `/assignments/${role === "TEACHER" ? `teacher/${id}` : `student/${id}`}`,
    )
  ).data;
export const publishAssignment = async (form) =>
  (
    await api.post("/assignments", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data;
export const submitAssignment = async (assignmentId, form) =>
  (
    await api.post(`/assignments/${assignmentId}/submissions`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data;
export const getAssignmentSubmissions = async (assignmentId, teacherId) =>
  (
    await api.get(
      `/assignments/${assignmentId}/submissions/teacher/${teacherId}`,
    )
  ).data;
export const gradeAssignment = async (
  assignmentId,
  submissionId,
  teacherId,
  payload,
) =>
  (
    await api.put(
      `/assignments/${assignmentId}/submissions/${submissionId}/grade`,
      payload,
      { params: { teacherId } },
    )
  ).data;
export const getAssignmentResults = async (assignmentId, teacherId) =>
  (await api.get(`/assignments/${assignmentId}/results/teacher/${teacherId}`))
    .data;
export const getStudentAssignmentResults = async (studentId) =>
  (await api.get(`/assignments/results/student/${studentId}`)).data;
export const getClassNotes = async (role, id) =>
  (
    await api.get(
      role === "TEACHER"
        ? `/class-notes/teacher/${id}`
        : `/class-notes/student/${id}`,
    )
  ).data;
export const publishClassNote = async (form) =>
  (
    await api.post("/class-notes", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data;
export const deleteClassNote = async (noteId, teacherId) =>
  api.delete(`/class-notes/${noteId}`, { params: { teacherId } });

export async function downloadLearningFile(path, fileName) {
  const response = await api.get(path, { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || "document.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
