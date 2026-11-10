import api from "./api";
export const getSimilarityReports = (assignmentId, teacherId) =>
  api.get(`/plagiarism/assignment/${assignmentId}`, { params: { teacherId } }).then(r => r.data);
export const getPlagiarismStats = (assignmentId, teacherId) =>
  api.get("/plagiarism/statistics", { params: { assignmentId, teacherId } }).then(r => r.data);
export const compareSubmissions = (payload) =>
  api.post("/plagiarism/compare", payload).then(r => r.data);
export const recheckSubmission = (submissionId, teacherId) =>
  api.post(`/plagiarism/recheck/${submissionId}`, null, { params: { teacherId } }).then(r => r.data);
export const getMySimilarityReports = (studentId) =>
  api.get(`/plagiarism/student/${studentId}`, { params: { requesterId: studentId } }).then(r => r.data);
export async function downloadSimilarityPdf(reportId, requesterId) {
  const response = await api.get(`/plagiarism/report/${reportId}/pdf`, {
    params: { requesterId }, responseType: "blob"
  });
  const url = URL.createObjectURL(response.data);
  const a = document.createElement("a");
  a.href = url; a.download = `similarity-report-${reportId}.pdf`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
