import axios from "axios";

// In development, Vite proxies /api to localhost:5000
// In production, point directly to the Render backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth functions
export async function loginUser(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function registerUser(userData) {
  const { data } = await api.post("/auth/register", userData);
  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

export function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export async function forgotPassword(email) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

export async function sendOTP(phone, purpose) {
  const { data } = await api.post("/otp/send", { phone, purpose });
  return data;
}

export async function verifyOTP(phone, code, purpose) {
  const { data } = await api.post("/otp/verify", { phone, code, purpose });
  return data;
}

export async function verifyResetOTP(phone, code) {
  const { data } = await api.post("/auth/verify-reset-otp", { phone, code });
  return data;
}

export async function resetPassword(token, password) {
  const { data } = await api.post("/auth/reset-password", { token, password });
  return data;
}

// Counselor management
export async function getCounselors() {
  const { data } = await api.get("/auth/counselors");
  return data.counselors;
}

export async function approveCounselor(id) {
  const { data } = await api.patch(`/auth/approve/${id}`);
  return data.user;
}

// Report functions
export async function uploadScreenshot(file) {
  const formData = new FormData();
  formData.append("screenshot", file);
  const { data } = await api.post("/reports/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function submitManualReport(text) {
  const { data } = await api.post("/reports/manual", { text });
  return data;
}

export async function getReports(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.category) params.append("category", filters.category);
  if (filters.severity) params.append("severity", filters.severity);
  if (filters.channel) params.append("channel", filters.channel);
  const { data } = await api.get(`/reports?${params.toString()}`);
  return data.reports;
}

export async function getReport(id) {
  const { data } = await api.get(`/reports/${id}`);
  return data.report;
}

// Referral functions
export async function getDistricts() {
  const { data } = await api.get("/districts");
  return data.districts;
}

export async function escalateReport(referralData) {
  const { data } = await api.post("/report/escalate", referralData);
  return data.referral;
}

export async function getCounselorCases(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  const { data } = await api.get(`/counselor/cases?${params.toString()}`);
  return data.cases;
}

export async function getUnassignedCases(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  const { data } = await api.get(`/counselor/unassigned?${params.toString()}`);
  return data.cases;
}

export async function getCaseById(id) {
  const { data } = await api.get(`/counselor/cases/${id}`);
  return data;
}

export async function claimCase(id) {
  const { data } = await api.post(`/counselor/cases/${id}/claim`);
  return data.case;
}

export async function updateCaseStatus(id, status) {
  const { data } = await api.patch(`/counselor/cases/${id}/status`, { status });
  return data.case;
}

export async function addCaseNote(id, note) {
  const { data } = await api.post(`/counselor/cases/${id}/notes`, { note });
  return data.note;
}

export async function getNationalAnalytics() {
  const { data } = await api.get("/national/analytics");
  return data;
}

// Notification functions
export async function getNotifications(unreadOnly = false) {
  const params = new URLSearchParams();
  if (unreadOnly) params.append("unreadOnly", "true");
  const { data } = await api.get(`/notifications?${params.toString()}`);
  return data.notifications;
}

export async function markNotificationRead(id) {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await api.post("/notifications/read-all");
}

// Data retention functions
export async function getRetentionStats() {
  const { data } = await api.get("/retention/stats");
  return data;
}

export async function triggerRetentionPurge() {
  const { data } = await api.post("/retention/purge");
  return data;
}

export async function deleteMyAccount() {
  const { data } = await api.delete("/retention/my-data");
  return data;
}

export default api;
