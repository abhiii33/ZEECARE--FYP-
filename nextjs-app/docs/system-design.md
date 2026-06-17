# ZeeCare Hospital Management System — System Design Document

## 1. System Overview

ZeeCare is a comprehensive, multi-role hospital management system designed to digitize and streamline hospital operations across patient care, doctor management, administration, bed management, inventory, OPD, and billing workflows.

### 1.1 Supported Roles

| Role | Description | Access Level |
|------|-------------|-------------|
| **Super Admin** | System owner with unrestricted access | Full system control |
| **Admin** | Hospital administrator managing operations | Dashboard, staff, inventory, beds, billing |
| **Doctor** | Medical practitioner providing care | Schedule, appointments, prescriptions, OPD, telemedicine |
| **Patient** | End user receiving medical services | Booking, records, payments, telemedicine |
| **Nurse** (Future) | Supporting clinical operations | Bed allocation, vitals, medication administration |
| **Pharmacist** (Future) | Dispensing medications | Inventory, prescription fulfillment |

---

## 2. Feature Modules

### 2.1 Authentication & Authorization

| Feature | Roles | Description |
|---------|-------|-------------|
| Patient Registration | Patient | Self-registration with NIC, DOB, email, phone validation |
| Login/Logout | All | JWT-based auth with role-based token cookies (`patientToken`, `adminToken`, `doctorToken`) |
| Password Reset | All | Email-based password recovery flow |
| Role-Based Access Control | All | Middleware-enforced route protection per role |
| Session Management | All | HTTP-only cookies with configurable expiry |
| OAuth2 Login | Patient | Google / Facebook social login (future) |

### 2.2 Doctor Management (Admin Role)

| Feature | Description |
|---------|-------------|
| Add Doctor | Register with personal info, department, qualifications, avatar (Cloudinary) |
| View All Doctors | Searchable directory with avatar, department, contact info |
| Doctor Profile | Bio, specialization, qualifications, experience, fees |
| Consulting Schedule | Weekly recurring time slots with max patient cap per slot |
| Doctor Leave Management | Mark leave days, auto-block appointments on leave dates |
| Performance Analytics | Appointment completion rate, patient ratings, revenue generated |
| Status Management | Active / On Leave / Suspended / Inactive |

### 2.3 Appointment Booking (Patient Role)

| Feature | Description |
|---------|-------------|
| Multi-Step Booking | 4-step wizard: Patient Info → Department & Doctor → Date & Time → Confirm |
| Department Selection | 9 departments with filtered doctor list |
| Doctor Availability | Real-time available slots based on consulting schedule and existing bookings |
| Time Slot Selection | 30-minute slots with visual availability grid |
| Appointment Types | In-Person, Telemedicine (Video), Home Visit |
| Priority Booking | Emergency / Urgent / Normal priority levels |
| Status Tracking | Pending → Accepted → In Progress → Completed / Cancelled / No Show |
| Appointment History | Complete history with filter by date, status, department |
| Rescheduling | Patient can reschedule up to 24h before appointment |
| Cancellation | Soft delete with reason tracking |
| Reminders | Automated email/SMS reminders 24h and 1h before appointment |

### 2.4 OPD Booking & Queue Management

| Feature | Roles | Description |
|---------|-------|-------------|
| OPD Registration | Patient | Walk-in / pre-booked OPD slot with token number |
| Token Generation | System | Auto-incrementing daily tokens per department |
| Queue Dashboard | Admin, Doctor | Real-time queue position, estimated wait time |
| Queue Management | Doctor | Call next patient, skip, re-queue, transfer |
| Priority Queue | Admin | Emergency patients jump the queue with flag |
| OPD Slots | Admin | Configure OPD hours per department (morning/evening) |
| Daily OPD Report | Admin | Patient count, avg wait time, department-wise breakdown |
| Patient Check-In | Admin | Mark patient arrival for pre-booked OPD |
| Triage | Nurse/Admin | Vitals recording (BP, temp, weight, SpO2) before consultation |

### 2.5 Consulting Hours & Doctor Schedule

| Feature | Roles | Description |
|---------|-------|-------------|
| Weekly Schedule | Doctor, Admin | Recurring time blocks per day of week |
| Slot Configuration | Doctor | Slot duration (15/20/30/45/60 min), max patients per slot |
| Morning/Evening Shifts | Admin | Separate OPD vs appointment schedules |
| Leave Calendar | Doctor | Apply for leave, admin approval workflow |
| Schedule Override | Admin | Override doctor schedule for specific dates |
| Auto-Blocking | System | Block appointment slots when doctor marks leave |
| Availability View | Patient | Visual calendar showing open/booked/unavailable slots |
| Multi-Location | Doctor | Schedule across multiple clinic locations (future) |

### 2.6 Bed Management & Ward Allocation

| Feature | Roles | Description |
|---------|-------|-------------|
| Ward Management | Admin | Create/edit wards with type (General, Semi-Private, Private, ICU, NICU, Pediatric) |
| Bed Registry | Admin | Add/edit beds per ward with bed number, type, status |
| Bed Status Board | Admin, Doctor | Real-time dashboard: Available / Occupied / Maintenance / Reserved |
| Admission | Admin | Allocate bed to patient with expected duration |
| Discharge | Admin, Doctor | Release bed, update records, trigger billing |
| Transfer | Admin | Move patient between beds/wards with history |
| Bed Occupancy Report | Admin | Occupancy percentage, department-wise, trend charts |
| Reservation | Doctor | Reserve beds for upcoming surgeries / admissions |
| Cleaning Queue | Admin | Mark bed for cleaning after discharge, track turnaround time |
| Daily Census | System | Auto-generated midnight census of occupied beds |

**Bed Status State Machine:**
```
Available → Reserved → Occupied → Discharge Pending → Cleaning → Available
                                 ↕ Transfer
Available → Maintenance → Available
```

### 2.7 Inventory & Resource Management

| Feature | Roles | Description |
|---------|-------|-------------|
| **Medical Supplies** | | |
| Category Management | Admin | Create supply categories (Surgical, Consumable, Equipment, PPE, Lab) |
| Item Registry | Admin | Add items with name, SKU, unit, min/max stock, supplier, price |
| Stock Tracking | Admin | Real-time quantity tracking with in/out transactions |
| Low Stock Alerts | System | Auto-notifications when stock falls below minimum threshold |
| Expiry Tracking | System | Flag items nearing expiry (30/60/90 day warnings) |
| Purchase Orders | Admin | Create POs for restocking with supplier management |
| Usage Logging | All Staff | Log item usage per department/patient/procedure |
| **Medicine Inventory** | | |
| Medicine Registry | Admin | Name, generic name, manufacturer, dosage form, strength |
| Batch Tracking | Admin | Batch number, manufacture date, expiry date per batch |
| Dispensing Log | Pharmacist | Track dispensed medicines against prescriptions |
| **Equipment** | | |
| Equipment Registry | Admin | Name, type, department, serial number, warranty, maintenance schedule |
| Equipment Booking | Doctor, Admin | Book operating rooms, ventilators, imaging machines |
| Maintenance Schedule | Admin | Preventive maintenance calendar with status tracking |
| **Reports** | | |
| Stock Valuation | Admin | Total inventory value by category |
| Consumption Report | Admin | Usage trends by department, time period |
| Expiry Report | Admin | Items expiring in next 30/60/90 days |

### 2.8 Health Records & Medical History (Patient Portal)

| Feature | Roles | Description |
|---------|-------|-------------|
| Vitals Dashboard | Patient | BP, heart rate, temperature, SpO2, weight, blood sugar |
| Vitals History | Patient, Doctor | Time-series charts for each vital |
| Medical Records | Doctor, Patient | Diagnosis, symptoms, treatment notes per visit |
| Prescriptions | Doctor → Patient | Digital prescription with medicine, dosage, frequency, duration |
| Lab Reports | Doctor → Patient | Upload/view lab test results with reference ranges |
| Radiology Reports | Doctor → Patient | X-ray, MRI, CT scan reports with image viewer |
| Allergies & Conditions | Doctor, Patient | Persistent list of known allergies and chronic conditions |
| Surgical History | Doctor, Patient | Past surgeries with date, doctor, hospital |
| Immunization Records | Doctor, Patient | Vaccination history with due dates |
| Download/Print | Patient | Export records as PDF |

### 2.9 Telemedicine

| Feature | Roles | Description |
|---------|-------|-------------|
| Video Consultation | Doctor, Patient | Secure WebRTC-based video calls |
| Doctor Availability | Patient | Real-time online/offline status of doctors |
| Session Booking | Patient | Book video session with preferred time slot |
| Waiting Room | Patient | Virtual waiting room before doctor joins |
| Chat Support | Doctor, Patient | In-call text chat for sharing info |
| Screen Share | Doctor | Share reports/images during consultation |
| Recording | System | Optional session recording (with consent) |
| E-Prescription | Doctor | Issue prescription during/after video call |
| Session History | All | Log of past telemedicine sessions |

### 2.10 Billing & Payments

| Feature | Roles | Description |
|---------|-------|-------------|
| Invoice Generation | Admin | Auto-generate from appointments, procedures, bed charges |
| Itemized Billing | Admin | Consultation, lab tests, medicines, bed charges, procedures |
| Insurance Processing | Admin | Link patient insurance, pre-authorization, claim submission |
| Online Payment | Patient | Pay via Razorpay/Stripe (card, UPI, net banking) |
| Payment History | Patient, Admin | Transaction log with status and receipts |
| Pending Dues | Admin | Dashboard of overdue payments |
| Revenue Dashboard | Admin | Daily/weekly/monthly revenue with department breakdown |
| Discount Management | Admin | Apply discounts per patient/category |
| Refund Processing | Admin | Process refunds for cancelled services |

### 2.11 Communication

| Feature | Roles | Description |
|---------|-------|-------------|
| Contact Form | Public | Name, email, phone, message → Admin inbox |
| In-App Notifications | All | Bell icon with unread count, grouped by type |
| Email Alerts | System | Appointment confirmations, reminders, lab results |
| SMS Alerts | System | OTP, appointment reminders, emergency alerts |
| Doctor Reviews | Patient | Star rating + text review for doctors |
| Announcements | Admin | Hospital-wide announcements (holiday closures, new services) |

### 2.12 Analytics & Reporting (Admin)

| Feature | Description |
|---------|-------------|
| Dashboard KPIs | Total appointments, doctors, patients, revenue, bed occupancy |
| Appointment Trends | Daily/weekly/monthly bar charts |
| Department Performance | Patient volume per department |
| Doctor Performance | Appointments completed, ratings, revenue |
| Revenue Analytics | Revenue by department, service type, payment method |
| Bed Occupancy Trends | Occupancy rate over time, department-wise |
| Inventory Insights | Stock levels, consumption patterns, expiry warnings |
| Patient Demographics | Age/gender distribution, location heatmap |
| OPD Statistics | Average wait time, daily token count, peak hours |

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | Server/client rendering, routing |
| **UI Library** | shadcn/ui + Radix UI | Accessible, composable components |
| **Styling** | Tailwind CSS | Utility-first CSS with dark mode |
| **State** | React Context + React Query | Client state + server state caching |
| **Forms** | React Hook Form + Zod | Validation and form management |
| **Charts** | Recharts | Admin analytics visualizations |
| **Animation** | Framer Motion | Page transitions, micro-interactions |
| **Backend** | Express.js (Node.js) | REST API server |
| **Database** | MongoDB (Mongoose) | Primary data store |
| **Cache** | Redis | Session cache, OPD queue, rate limiting |
| **Auth** | JWT + bcrypt | Token-based auth with password hashing |
| **File Storage** | Cloudinary / AWS S3 | Doctor avatars, reports, documents |
| **Email** | Nodemailer + SendGrid | Transactional emails |
| **SMS** | Twilio / MSG91 | Appointment reminders, OTPs |
| **Video** | Twilio Video / Jitsi | Telemedicine video calls |
| **Payments** | Razorpay / Stripe | Online billing |
| **Deployment** | Vercel (FE) + AWS EC2 (BE) | Hosting |
| **CI/CD** | GitHub Actions | Automated testing + deployment |
| **Monitoring** | Prometheus + Grafana | Performance monitoring |
| **Logging** | Winston + ELK Stack | Centralized logging |

---

## 4. API Route Structure

```
/api/v1/
├── /auth
│   ├── POST   /register          (Patient self-registration)
│   ├── POST   /login             (All roles)
│   ├── POST   /logout            (All roles)
│   ├── POST   /forgot-password   (All roles)
│   └── POST   /reset-password    (All roles)
│
├── /users
│   ├── GET    /me                (Current user profile)
│   ├── PUT    /me                (Update own profile)
│   ├── GET    /doctors           (Public doctor directory)
│   ├── GET    /doctors/:id       (Doctor detail)
│   ├── POST   /doctors           (Admin: add doctor)
│   ├── PUT    /doctors/:id       (Admin: update doctor)
│   ├── DELETE /doctors/:id       (Admin: deactivate doctor)
│   ├── POST   /admins            (Admin: add admin)
│   └── GET    /patients          (Admin: patient list)
│
├── /appointments
│   ├── POST   /                  (Patient: book appointment)
│   ├── GET    /                  (Admin: all appointments)
│   ├── GET    /my                (Patient/Doctor: own appointments)
│   ├── GET    /:id               (Appointment detail)
│   ├── PUT    /:id/status        (Admin/Doctor: update status)
│   ├── PUT    /:id/reschedule    (Patient: reschedule)
│   └── DELETE /:id               (Admin: cancel)
│
├── /opd
│   ├── POST   /register          (Patient: OPD registration)
│   ├── GET    /queue/:deptId     (Queue for department)
│   ├── PUT    /queue/:id/next    (Doctor: call next patient)
│   ├── PUT    /queue/:id/skip    (Doctor: skip patient)
│   └── GET    /daily-report      (Admin: daily OPD report)
│
├── /schedule
│   ├── GET    /doctor/:id        (Doctor's consulting hours)
│   ├── PUT    /doctor/:id        (Doctor: update schedule)
│   ├── POST   /doctor/:id/leave  (Doctor: apply leave)
│   ├── GET    /availability/:id  (Public: available slots)
│   └── GET    /leaves            (Admin: all pending leaves)
│
├── /beds
│   ├── GET    /                  (Admin: all beds with status)
│   ├── GET    /wards             (Admin: ward list)
│   ├── POST   /wards             (Admin: create ward)
│   ├── POST   /allocate          (Admin: allocate bed)
│   ├── PUT    /:id/discharge     (Admin/Doctor: discharge)
│   ├── PUT    /:id/transfer      (Admin: transfer patient)
│   └── GET    /occupancy-report  (Admin: occupancy stats)
│
├── /inventory
│   ├── GET    /                  (Admin: all items)
│   ├── POST   /                  (Admin: add item)
│   ├── PUT    /:id               (Admin: update stock)
│   ├── POST   /:id/transaction   (Admin: stock in/out)
│   ├── GET    /low-stock         (Admin: low stock alerts)
│   ├── GET    /expiring          (Admin: expiring items)
│   └── GET    /medicines         (Pharmacist: medicine list)
│
├── /medical-records
│   ├── GET    /patient/:id       (Doctor: patient records)
│   ├── POST   /                  (Doctor: create record)
│   ├── POST   /prescriptions     (Doctor: create prescription)
│   ├── GET    /prescriptions/my  (Patient: my prescriptions)
│   ├── POST   /lab-reports       (Doctor: upload lab report)
│   └── GET    /lab-reports/my    (Patient: my lab reports)
│
├── /billing
│   ├── POST   /invoices          (Admin: generate invoice)
│   ├── GET    /invoices          (Admin: all invoices)
│   ├── GET    /invoices/my       (Patient: my invoices)
│   ├── POST   /payments          (Patient: make payment)
│   ├── GET    /revenue-report    (Admin: revenue analytics)
│   └── POST   /refunds           (Admin: process refund)
│
├── /messages
│   ├── POST   /                  (Public: contact form)
│   └── GET    /                  (Admin: all messages)
│
├── /notifications
│   ├── GET    /                  (User: my notifications)
│   ├── PUT    /:id/read          (User: mark as read)
│   └── POST   /announce          (Admin: send announcement)
│
├── /reviews
│   ├── POST   /                  (Patient: review doctor)
│   ├── GET    /doctor/:id        (Public: doctor reviews)
│   └── GET    /                  (Admin: all reviews)
│
└── /telemedicine
    ├── POST   /sessions          (Create video session)
    ├── GET    /sessions/:id      (Get session details)
    └── PUT    /sessions/:id/end  (End session)
```

---

## 5. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Performance** | API response < 200ms (p95), Page load < 2s |
| **Scalability** | Support 10,000 concurrent users |
| **Availability** | 99.9% uptime SLA |
| **Security** | HIPAA compliant, AES-256 encryption at rest, TLS 1.3 in transit |
| **Data Retention** | Medical records: 10 years, Logs: 1 year |
| **Backup** | Automated daily backups, 30-day retention, point-in-time recovery |
| **Audit Trail** | All data modifications logged with user, timestamp, old/new values |
| **Accessibility** | WCAG 2.1 AA compliance |
| **Internationalization** | Multi-language support (English, Hindi, Urdu) |
| **Mobile Responsiveness** | Full functionality on 320px+ viewports |

---

## 6. Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Security Layers                      │
├─────────────────────────────────────────────────────────┤
│ Layer 1: Network         │ HTTPS/TLS 1.3, WAF, DDoS    │
│ Layer 2: Application     │ CORS, CSP, Rate Limiting     │
│ Layer 3: Authentication  │ JWT (access + refresh tokens) │
│ Layer 4: Authorization   │ Role-Based Access Control     │
│ Layer 5: Data            │ bcrypt passwords, AES-256     │
│ Layer 6: Audit           │ Immutable audit log trail     │
│ Layer 7: Backup          │ Encrypted backups, DR plan    │
└─────────────────────────────────────────────────────────┘
```
