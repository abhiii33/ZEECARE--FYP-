export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  NIC: string;
  DOB: string;
  gender: "Male" | "Female";
  role: "Patient" | "Doctor" | "Admin";
  doctorDepartment?: string;
  docAvatar?: { public_id: string; url: string };
}

export interface Appointment {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  NIC: string;
  DOB: string;
  gender: string;
  appointment_date: string;
  department: string;
  doctor: { firstName: string; lastName: string };
  doctorId: string;
  patientId: string;
  hasVisited: boolean;
  address: string;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
}

export interface Message {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

export interface Department {
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface Review {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  doctorId: string;
}

export interface HealthRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  doctor: string;
  attachments?: string[];
}
