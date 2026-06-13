import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// Auth
export const registerPatient = (data: Record<string, unknown>) =>
  api.post("/user/patient/register", data);
export const loginUser = (data: { email: string; password: string; role: string }) =>
  api.post("/user/login", data);
export const logoutPatient = () => api.get("/user/patient/logout");
export const logoutAdmin = () => api.get("/user/admin/logout");
export const getPatientProfile = () => api.get("/user/patient/me");
export const getAdminProfile = () => api.get("/user/admin/me");

// Doctors
export const getAllDoctors = () => api.get("/user/doctors");
export const addDoctor = (data: FormData) =>
  api.post("/user/doctor/addnew", data, { headers: { "Content-Type": "multipart/form-data" } });
export const addAdmin = (data: Record<string, unknown>) => api.post("/user/admin/addnew", data);

// Appointments
export const bookAppointment = (data: Record<string, unknown>) =>
  api.post("/appointment/post", data);
export const getAllAppointments = () => api.get("/appointment/getall");
export const updateAppointment = (id: string, data: Record<string, unknown>) =>
  api.put(`/appointment/update/${id}`, data);
export const deleteAppointment = (id: string) => api.delete(`/appointment/delete/${id}`);

// Messages
export const sendMessage = (data: Record<string, unknown>) => api.post("/message/send", data);
export const getAllMessages = () => api.get("/message/getall");
