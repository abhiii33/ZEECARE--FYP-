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

// ==================== AUTH ====================
export const registerPatient = (data: Record<string, unknown>) =>
  api.post("/user/patient/register", data);
export const loginUser = (data: { email: string; password: string; confirmPassword: string; role: string }) =>
  api.post("/user/login", data);
export const logoutPatient = () => api.get("/user/patient/logout");
export const logoutAdmin = () => api.get("/user/admin/logout");
export const logoutDoctor = () => api.get("/user/doctor/logout");
export const getPatientProfile = () => api.get("/user/patient/me");
export const getAdminProfile = () => api.get("/user/admin/me");
export const getDoctorProfile = () => api.get("/user/doctor/me");
export const getDoctorAppointments = () => api.get("/appointment/getall");

// ==================== USERS / DOCTORS ====================
export const getAllDoctors = () => api.get("/user/doctors");
export const addDoctor = (data: FormData) =>
  api.post("/user/doctor/addnew", data, { headers: { "Content-Type": "multipart/form-data" } });
export const addAdmin = (data: Record<string, unknown>) => api.post("/user/admin/addnew", data);

// ==================== DEPARTMENTS ====================
export const getAllDepartments = () => api.get("/department/getall");
export const createDepartment = (data: Record<string, unknown>) => api.post("/department/create", data);
export const updateDepartment = (id: string, data: Record<string, unknown>) =>
  api.put(`/department/update/${id}`, data);

// ==================== APPOINTMENTS ====================
export const bookAppointment = (data: Record<string, unknown>) =>
  api.post("/appointment/post", data);
export const getAllAppointments = () => api.get("/appointment/getall");
export const updateAppointment = (id: string, data: Record<string, unknown>) =>
  api.put(`/appointment/update/${id}`, data);
export const deleteAppointment = (id: string) => api.delete(`/appointment/delete/${id}`);

// ==================== CONSULTING SCHEDULE ====================
export const getDoctorSchedule = (doctorId: string) => api.get(`/schedule/doctor/${doctorId}`);
export const createSchedule = (data: Record<string, unknown>) => api.post("/schedule/create", data);
export const updateSchedule = (id: string, data: Record<string, unknown>) =>
  api.put(`/schedule/update/${id}`, data);
export const deleteSchedule = (id: string) => api.delete(`/schedule/delete/${id}`);
export const getAvailableSlots = (doctorId: string, date: string) =>
  api.get(`/schedule/availability?doctorId=${doctorId}&date=${date}`);
export const applyLeave = (data: Record<string, unknown>) => api.post("/schedule/leave/apply", data);
export const getDoctorLeaves = (doctorId: string) => api.get(`/schedule/doctor/${doctorId}/leaves`);
export const getAllLeaves = (status?: string) =>
  api.get(`/schedule/leaves${status ? `?status=${status}` : ""}`);
export const updateLeaveStatus = (id: string, status: string) =>
  api.put(`/schedule/leave/${id}/status`, { status });

// ==================== OPD ====================
export const registerOPD = (data: Record<string, unknown>) => api.post("/opd/register", data);
export const getOPDQueue = (params?: Record<string, string>) =>
  api.get("/opd/queue", { params });
export const callNextOPDPatient = () => api.put("/opd/call-next");
export const updateOPDStatus = (id: string, status: string) =>
  api.put(`/opd/update/${id}`, { status });
export const skipOPDPatient = (id: string) => api.put(`/opd/skip/${id}`);
export const getOPDDailyReport = (date?: string) =>
  api.get(`/opd/daily-report${date ? `?date=${date}` : ""}`);
export const getMyOPDBookings = () => api.get("/opd/my-bookings");

// ==================== BED MANAGEMENT ====================
export const getAllWards = () => api.get("/bed/wards");
export const createWard = (data: Record<string, unknown>) => api.post("/bed/wards", data);
export const updateWard = (id: string, data: Record<string, unknown>) =>
  api.put(`/bed/wards/${id}`, data);
export const getAllBeds = (params?: Record<string, string>) => api.get("/bed", { params });
export const createBed = (data: Record<string, unknown>) => api.post("/bed", data);
export const updateBedStatus = (id: string, status: string) =>
  api.put(`/bed/${id}/status`, { status });
export const getBedOccupancy = () => api.get("/bed/occupancy");
export const allocateBed = (data: Record<string, unknown>) => api.post("/bed/allocate", data);
export const dischargeBed = (id: string, notes?: string) =>
  api.put(`/bed/discharge/${id}`, { dischargeNotes: notes });
export const getAllAllocations = (status?: string) =>
  api.get(`/bed/allocations${status ? `?status=${status}` : ""}`);
export const transferBed = (data: Record<string, unknown>) => api.post("/bed/transfer", data);

// ==================== INVENTORY ====================
export const getInventoryCategories = () => api.get("/inventory/categories");
export const createInventoryCategory = (data: Record<string, unknown>) =>
  api.post("/inventory/categories", data);
export const getInventoryItems = (params?: Record<string, string>) =>
  api.get("/inventory/items", { params });
export const createInventoryItem = (data: Record<string, unknown>) =>
  api.post("/inventory/items", data);
export const updateInventoryItem = (id: string, data: Record<string, unknown>) =>
  api.put(`/inventory/items/${id}`, data);
export const getLowStockItems = () => api.get("/inventory/low-stock");
export const getInventoryStats = () => api.get("/inventory/stats");
export const createInventoryTransaction = (data: Record<string, unknown>) =>
  api.post("/inventory/transactions", data);
export const getInventoryTransactions = (params?: Record<string, string>) =>
  api.get("/inventory/transactions", { params });
export const getAllMedicines = (params?: Record<string, string>) =>
  api.get("/inventory/medicines", { params });
export const createMedicine = (data: Record<string, unknown>) =>
  api.post("/inventory/medicines", data);
export const updateMedicine = (id: string, data: Record<string, unknown>) =>
  api.put(`/inventory/medicines/${id}`, data);
export const getExpiringMedicines = (days?: number) =>
  api.get(`/inventory/medicines/expiring${days ? `?days=${days}` : ""}`);

// ==================== MEDICAL RECORDS ====================
export const createMedicalRecord = (data: Record<string, unknown>) =>
  api.post("/medical-records", data);
export const getPatientRecords = (patientId: string) =>
  api.get(`/medical-records/patient/${patientId}`);
export const getMyMedicalRecords = () => api.get("/medical-records/my-records");
export const createPrescription = (data: Record<string, unknown>) =>
  api.post("/medical-records/prescriptions", data);
export const getPatientPrescriptions = (patientId: string) =>
  api.get(`/medical-records/prescriptions/patient/${patientId}`);
export const getMyPrescriptions = () => api.get("/medical-records/prescriptions/my");
export const createLabReport = (data: Record<string, unknown>) =>
  api.post("/medical-records/lab-reports", data);
export const getMyLabReports = () => api.get("/medical-records/lab-reports/my");
export const updateLabReport = (id: string, data: Record<string, unknown>) =>
  api.put(`/medical-records/lab-reports/${id}`, data);

// ==================== BILLING ====================
export const createInvoice = (data: Record<string, unknown>) =>
  api.post("/billing/invoices", data);
export const getAllInvoices = (params?: Record<string, string>) =>
  api.get("/billing/invoices", { params });
export const getMyInvoices = () => api.get("/billing/invoices/my");
export const getInvoiceById = (id: string) => api.get(`/billing/invoices/${id}`);
export const makePayment = (data: Record<string, unknown>) =>
  api.post("/billing/payments", data);
export const getPaymentHistory = () => api.get("/billing/payments");
export const getRevenueReport = (period?: string) =>
  api.get(`/billing/revenue${period ? `?period=${period}` : ""}`);
export const updateInvoiceStatus = (id: string, status: string) =>
  api.put(`/billing/invoices/${id}/status`, { status });
export const addInsurance = (data: Record<string, unknown>) =>
  api.post("/billing/insurance", data);
export const getMyInsurance = () => api.get("/billing/insurance/my");

// ==================== REVIEWS ====================
export const createReview = (data: Record<string, unknown>) => api.post("/review", data);
export const getDoctorReviews = (doctorId: string) => api.get(`/review/doctor/${doctorId}`);
export const getAllReviews = () => api.get("/review");

// ==================== NOTIFICATIONS ====================
export const getMyNotifications = (unreadOnly?: boolean) =>
  api.get(`/notification${unreadOnly ? "?unreadOnly=true" : ""}`);
export const markNotificationRead = (id: string) => api.put(`/notification/${id}/read`);
export const markAllNotificationsRead = () => api.put("/notification/read-all");
export const sendAnnouncement = (data: Record<string, unknown>) =>
  api.post("/notification/announce", data);

// ==================== MESSAGES ====================
export const sendMessage = (data: Record<string, unknown>) => api.post("/message/send", data);
export const getAllMessages = () => api.get("/message/getall");
