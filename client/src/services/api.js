import axios from "axios";

// In development, Vite proxies /api to localhost:5000
// In production, point directly to the Render backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
});

// Upload screenshot and get analysis
export async function uploadScreenshot(file) {
  const formData = new FormData();
  formData.append("screenshot", file);
  const { data } = await api.post("/reports/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// Get all reports (counselor dashboard)
export async function getReports(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.category) params.append("category", filters.category);
  if (filters.severity) params.append("severity", filters.severity);
  const { data } = await api.get(`/reports?${params.toString()}`);
  return data.reports;
}

// Get single report
export async function getReport(id) {
  const { data } = await api.get(`/reports/${id}`);
  return data.report;
}

// Update report status
export async function updateReportStatus(id, status) {
  const { data } = await api.patch(`/reports/${id}/status`, { status });
  return data.report;
}

// Get national stats
export async function getStats() {
  const { data } = await api.get("/reports/stats");
  return data.stats;
}

export default api;
