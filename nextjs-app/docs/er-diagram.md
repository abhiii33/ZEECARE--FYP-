# ZeeCare Hospital Management System — ER Diagram

## Complete Entity Relationship Diagram

```mermaid
erDiagram
    %% ============================================================
    %% CORE: USERS & AUTHENTICATION
    %% ============================================================

    USER {
        ObjectId _id PK
        String firstName
        String lastName
        String email UK
        String phone
        String NIC UK
        Date DOB
        Enum gender "Male | Female"
        String password
        Enum role "Patient | Doctor | Admin | SuperAdmin"
        Enum status "Active | Inactive | Suspended"
        Date createdAt
        Date updatedAt
    }

    DOCTOR_PROFILE {
        ObjectId _id PK
        ObjectId userId FK
        String departmentId FK
        String specialization
        String qualification
        Int experienceYears
        Decimal consultingFee
        String bio
        String licenseNo
        String avatarPublicId
        String avatarUrl
        Enum status "Active | OnLeave | Suspended"
        Decimal avgRating
        Int totalReviews
        Date createdAt
    }

    %% ============================================================
    %% DEPARTMENTS
    %% ============================================================

    DEPARTMENT {
        ObjectId _id PK
        String name UK
        String description
        String icon
        ObjectId headDoctorId FK
        Int floorNumber
        String contactPhone
        Enum status "Active | Inactive"
        Date createdAt
    }

    %% ============================================================
    %% APPOINTMENT SYSTEM
    %% ============================================================

    APPOINTMENT {
        ObjectId _id PK
        ObjectId patientId FK
        ObjectId doctorId FK
        ObjectId departmentId FK
        Date appointmentDate
        String timeSlot
        Enum type "InPerson | Telemedicine | HomeVisit"
        Enum priority "Normal | Urgent | Emergency"
        Enum status "Pending | Accepted | InProgress | Completed | Cancelled | NoShow"
        String symptoms
        String notes
        String address
        Boolean hasVisited
        String cancellationReason
        Date createdAt
        Date updatedAt
    }

    %% ============================================================
    %% OPD SYSTEM
    %% ============================================================

    OPD_SLOT_CONFIG {
        ObjectId _id PK
        ObjectId departmentId FK
        Enum shiftType "Morning | Evening"
        Time startTime
        Time endTime
        Int maxTokens
        Enum status "Active | Inactive"
    }

    OPD_BOOKING {
        ObjectId _id PK
        ObjectId patientId FK
        ObjectId departmentId FK
        ObjectId doctorId FK
        Int tokenNumber
        Date bookingDate
        Enum shiftType "Morning | Evening"
        Enum status "Registered | Waiting | InConsultation | Completed | Skipped | Cancelled"
        Enum priority "Normal | Emergency"
        String symptoms
        Date checkInTime
        Date consultStartTime
        Date consultEndTime
        Date createdAt
    }

    OPD_TRIAGE {
        ObjectId _id PK
        ObjectId opdBookingId FK
        ObjectId recordedBy FK
        Decimal bloodPressureSystolic
        Decimal bloodPressureDiastolic
        Decimal heartRate
        Decimal temperature
        Decimal weight
        Decimal height
        Decimal spO2
        Decimal bloodSugar
        String notes
        Date recordedAt
    }

    %% ============================================================
    %% CONSULTING HOURS & SCHEDULE
    %% ============================================================

    CONSULTING_SCHEDULE {
        ObjectId _id PK
        ObjectId doctorId FK
        Enum dayOfWeek "Mon | Tue | Wed | Thu | Fri | Sat | Sun"
        Time startTime
        Time endTime
        Int slotDurationMinutes
        Int maxPatientsPerSlot
        Enum scheduleType "Appointment | OPD"
        Boolean isActive
        Date effectiveFrom
        Date effectiveTo
    }

    DOCTOR_LEAVE {
        ObjectId _id PK
        ObjectId doctorId FK
        Date leaveDate
        Enum leaveType "Sick | Personal | Conference | Holiday"
        String reason
        Enum status "Pending | Approved | Rejected"
        ObjectId approvedBy FK
        Date createdAt
    }

    SCHEDULE_OVERRIDE {
        ObjectId _id PK
        ObjectId doctorId FK
        Date overrideDate
        Time startTime
        Time endTime
        String reason
        ObjectId createdBy FK
        Date createdAt
    }

    %% ============================================================
    %% BED & WARD MANAGEMENT
    %% ============================================================

    WARD {
        ObjectId _id PK
        String name
        ObjectId departmentId FK
        Enum wardType "General | SemiPrivate | Private | ICU | NICU | Pediatric | Maternity | Isolation"
        Int totalBeds
        Int floor
        String nurseStation
        Decimal dailyRate
        Enum status "Active | Maintenance | Closed"
        Date createdAt
    }

    BED {
        ObjectId _id PK
        ObjectId wardId FK
        String bedNumber
        Enum bedType "Standard | Electric | Bariatric | Pediatric | ICU"
        Enum status "Available | Occupied | Reserved | Maintenance | Cleaning"
        String features
        Date lastSanitized
        Date createdAt
    }

    BED_ALLOCATION {
        ObjectId _id PK
        ObjectId bedId FK
        ObjectId patientId FK
        ObjectId admittedBy FK
        ObjectId doctorInCharge FK
        Date admissionDate
        Date expectedDischarge
        Date actualDischarge
        String admissionReason
        String dischargeNotes
        Enum status "Active | Discharged | Transferred"
        Date createdAt
    }

    BED_TRANSFER {
        ObjectId _id PK
        ObjectId allocationId FK
        ObjectId fromBedId FK
        ObjectId toBedId FK
        String reason
        ObjectId transferredBy FK
        Date transferDate
    }

    %% ============================================================
    %% INVENTORY & RESOURCES
    %% ============================================================

    INVENTORY_CATEGORY {
        ObjectId _id PK
        String name
        String description
        Enum type "MedicalSupply | Medicine | Equipment | Consumable | PPE | Lab"
    }

    INVENTORY_ITEM {
        ObjectId _id PK
        ObjectId categoryId FK
        String name
        String sku UK
        String description
        String unit
        Int quantity
        Int minStock
        Int maxStock
        Decimal unitPrice
        String supplier
        String storageLocation
        Enum status "InStock | LowStock | OutOfStock | Discontinued"
        Date createdAt
    }

    MEDICINE {
        ObjectId _id PK
        ObjectId categoryId FK
        String name
        String genericName
        String manufacturer
        Enum dosageForm "Tablet | Capsule | Syrup | Injection | Cream | Drops | Inhaler"
        String strength
        Decimal price
        Int stock
        Int minStock
        String batchNumber
        Date manufactureDate
        Date expiryDate
        Boolean requiresPrescription
    }

    INVENTORY_TRANSACTION {
        ObjectId _id PK
        ObjectId itemId FK
        Enum type "StockIn | StockOut | Adjustment | Return | Expired"
        Int quantity
        String reason
        ObjectId performedBy FK
        ObjectId departmentId FK
        ObjectId patientId FK
        String referenceNo
        Date transactionDate
    }

    EQUIPMENT {
        ObjectId _id PK
        String name
        Enum type "Diagnostic | Surgical | Monitoring | Imaging | Laboratory | Therapeutic"
        ObjectId departmentId FK
        String serialNumber UK
        String manufacturer
        Date purchaseDate
        Date warrantyExpiry
        Decimal purchasePrice
        Enum status "Available | InUse | Maintenance | Retired"
        String location
        Date lastMaintenanceDate
        Date nextMaintenanceDate
    }

    EQUIPMENT_BOOKING {
        ObjectId _id PK
        ObjectId equipmentId FK
        ObjectId bookedBy FK
        ObjectId patientId FK
        DateTime startTime
        DateTime endTime
        String purpose
        Enum status "Booked | InUse | Completed | Cancelled"
        Date createdAt
    }

    %% ============================================================
    %% MEDICAL RECORDS & PRESCRIPTIONS
    %% ============================================================

    MEDICAL_RECORD {
        ObjectId _id PK
        ObjectId patientId FK
        ObjectId doctorId FK
        ObjectId appointmentId FK
        Date visitDate
        String chiefComplaint
        String diagnosis
        String symptoms
        String treatment
        String clinicalNotes
        String followUpInstructions
        Date followUpDate
        Date createdAt
    }

    PRESCRIPTION {
        ObjectId _id PK
        ObjectId medicalRecordId FK
        ObjectId patientId FK
        ObjectId doctorId FK
        Date prescriptionDate
        Enum status "Active | Completed | Cancelled"
        String pharmacyNotes
        Date createdAt
    }

    PRESCRIPTION_ITEM {
        ObjectId _id PK
        ObjectId prescriptionId FK
        ObjectId medicineId FK
        String medicineName
        String dosage
        String frequency
        Int durationDays
        String instructions
        Int quantity
        Boolean isDispensed
    }

    LAB_REPORT {
        ObjectId _id PK
        ObjectId patientId FK
        ObjectId orderedBy FK
        ObjectId departmentId FK
        String testName
        String testCategory
        String result
        String referenceRange
        String interpretation
        Enum status "Ordered | SampleCollected | Processing | Completed | Cancelled"
        String reportFileUrl
        Date orderedDate
        Date completedDate
    }

    ALLERGY {
        ObjectId _id PK
        ObjectId patientId FK
        String allergen
        Enum severity "Mild | Moderate | Severe | LifeThreatening"
        String reaction
        Date reportedDate
        ObjectId reportedBy FK
    }

    VITAL_READING {
        ObjectId _id PK
        ObjectId patientId FK
        ObjectId recordedBy FK
        Decimal bloodPressureSystolic
        Decimal bloodPressureDiastolic
        Decimal heartRate
        Decimal temperature
        Decimal weight
        Decimal spO2
        Decimal bloodSugar
        String notes
        Date recordedAt
    }

    %% ============================================================
    %% BILLING & PAYMENTS
    %% ============================================================

    INVOICE {
        ObjectId _id PK
        String invoiceNumber UK
        ObjectId patientId FK
        ObjectId appointmentId FK
        ObjectId bedAllocationId FK
        Decimal subtotal
        Decimal discount
        Decimal tax
        Decimal totalAmount
        Enum status "Draft | Pending | PartiallyPaid | Paid | Overdue | Cancelled | Refunded"
        Date issueDate
        Date dueDate
        Date createdAt
    }

    INVOICE_ITEM {
        ObjectId _id PK
        ObjectId invoiceId FK
        Enum itemType "Consultation | LabTest | Medicine | BedCharge | Procedure | Equipment | Other"
        String description
        Int quantity
        Decimal unitPrice
        Decimal amount
    }

    PAYMENT {
        ObjectId _id PK
        ObjectId invoiceId FK
        ObjectId patientId FK
        Decimal amount
        Enum method "Cash | Card | UPI | NetBanking | Insurance | Wallet"
        String transactionId
        Enum status "Pending | Success | Failed | Refunded"
        Date paymentDate
    }

    INSURANCE {
        ObjectId _id PK
        ObjectId patientId FK
        String providerName
        String policyNumber UK
        String groupNumber
        Date validFrom
        Date validTo
        Decimal coverageAmount
        Decimal usedAmount
        Enum status "Active | Expired | Cancelled"
        Date createdAt
    }

    %% ============================================================
    %% COMMUNICATION & NOTIFICATIONS
    %% ============================================================

    MESSAGE {
        ObjectId _id PK
        String firstName
        String lastName
        String email
        String phone
        String message
        Enum status "Unread | Read | Replied"
        Date createdAt
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId userId FK
        String title
        String body
        Enum type "Appointment | OPD | LabResult | Prescription | Payment | System | Announcement"
        Enum channel "InApp | Email | SMS | Push"
        Boolean isRead
        String actionUrl
        Date createdAt
    }

    REVIEW {
        ObjectId _id PK
        ObjectId patientId FK
        ObjectId doctorId FK
        ObjectId appointmentId FK
        Int rating
        String comment
        Enum status "Published | Hidden | Flagged"
        Date createdAt
    }

    ANNOUNCEMENT {
        ObjectId _id PK
        ObjectId createdBy FK
        String title
        String content
        Enum targetRole "All | Patient | Doctor | Admin"
        Enum priority "Low | Medium | High | Urgent"
        Date publishDate
        Date expiryDate
        Boolean isActive
    }

    %% ============================================================
    %% TELEMEDICINE
    %% ============================================================

    VIDEO_SESSION {
        ObjectId _id PK
        ObjectId appointmentId FK
        ObjectId doctorId FK
        ObjectId patientId FK
        String roomUrl
        String sessionToken
        DateTime scheduledStart
        DateTime actualStart
        DateTime actualEnd
        Int durationMinutes
        Enum status "Scheduled | Waiting | InProgress | Completed | Failed | NoShow"
        Boolean isRecorded
        String recordingUrl
        Date createdAt
    }

    %% ============================================================
    %% AUDIT LOG
    %% ============================================================

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId userId FK
        String action
        String entityType
        ObjectId entityId
        Object previousValues
        Object newValues
        String ipAddress
        String userAgent
        Date timestamp
    }

    %% ============================================================
    %% RELATIONSHIPS
    %% ============================================================

    USER ||--o| DOCTOR_PROFILE : "has doctor profile"
    USER ||--o{ APPOINTMENT : "books (as patient)"
    USER ||--o{ APPOINTMENT : "attends (as doctor)"
    USER ||--o{ OPD_BOOKING : "registers (as patient)"
    USER ||--o{ OPD_BOOKING : "consults (as doctor)"
    USER ||--o{ MEDICAL_RECORD : "has records (as patient)"
    USER ||--o{ MEDICAL_RECORD : "creates (as doctor)"
    USER ||--o{ PRESCRIPTION : "receives (as patient)"
    USER ||--o{ PRESCRIPTION : "writes (as doctor)"
    USER ||--o{ LAB_REPORT : "receives (as patient)"
    USER ||--o{ LAB_REPORT : "orders (as doctor)"
    USER ||--o{ ALLERGY : "has allergies"
    USER ||--o{ VITAL_READING : "has vitals"
    USER ||--o{ REVIEW : "writes (as patient)"
    USER ||--o{ REVIEW : "receives (as doctor)"
    USER ||--o{ INVOICE : "billed (as patient)"
    USER ||--o{ PAYMENT : "pays"
    USER ||--o{ INSURANCE : "has insurance"
    USER ||--o{ BED_ALLOCATION : "admitted"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ VIDEO_SESSION : "participates"
    USER ||--o{ CONSULTING_SCHEDULE : "has schedule (as doctor)"
    USER ||--o{ DOCTOR_LEAVE : "applies leave"
    USER ||--o{ AUDIT_LOG : "performs action"

    DEPARTMENT ||--o{ DOCTOR_PROFILE : "has doctors"
    DEPARTMENT ||--o{ APPOINTMENT : "receives appointments"
    DEPARTMENT ||--o{ OPD_SLOT_CONFIG : "has OPD config"
    DEPARTMENT ||--o{ OPD_BOOKING : "receives OPD patients"
    DEPARTMENT ||--o{ WARD : "manages wards"
    DEPARTMENT ||--o{ EQUIPMENT : "owns equipment"
    DEPARTMENT ||--o{ LAB_REPORT : "processes tests"
    DEPARTMENT ||--o{ INVENTORY_TRANSACTION : "uses inventory"

    APPOINTMENT ||--o| MEDICAL_RECORD : "generates record"
    APPOINTMENT ||--o| VIDEO_SESSION : "has video session"
    APPOINTMENT ||--o| INVOICE : "generates invoice"
    APPOINTMENT ||--o| REVIEW : "reviewed by patient"

    OPD_BOOKING ||--o| OPD_TRIAGE : "has triage"

    CONSULTING_SCHEDULE }o--|| USER : "belongs to doctor"
    DOCTOR_LEAVE }o--|| USER : "belongs to doctor"
    SCHEDULE_OVERRIDE }o--|| USER : "overrides doctor"

    WARD ||--o{ BED : "contains beds"
    BED ||--o{ BED_ALLOCATION : "allocated to patients"
    BED_ALLOCATION ||--o{ BED_TRANSFER : "has transfers"

    INVENTORY_CATEGORY ||--o{ INVENTORY_ITEM : "contains items"
    INVENTORY_CATEGORY ||--o{ MEDICINE : "contains medicines"
    INVENTORY_ITEM ||--o{ INVENTORY_TRANSACTION : "has transactions"

    EQUIPMENT ||--o{ EQUIPMENT_BOOKING : "booked for use"

    MEDICAL_RECORD ||--o{ PRESCRIPTION : "includes prescriptions"
    PRESCRIPTION ||--o{ PRESCRIPTION_ITEM : "contains items"
    PRESCRIPTION_ITEM }o--|| MEDICINE : "references medicine"

    INVOICE ||--o{ INVOICE_ITEM : "has line items"
    INVOICE ||--o{ PAYMENT : "receives payments"
```

## Entity Summary Table

| Entity | Count | Primary Role | Key Relationships |
|--------|-------|-------------|-------------------|
| USER | Core | All Roles | Central entity for auth, linked to everything |
| DOCTOR_PROFILE | Extension | Doctor | Extends USER with medical specialization data |
| DEPARTMENT | Reference | Admin | Groups doctors, appointments, wards, equipment |
| APPOINTMENT | Transactional | Patient, Doctor | Bookings with multi-status workflow |
| OPD_BOOKING | Transactional | Patient, Doctor | Walk-in queue with token system |
| OPD_TRIAGE | Support | Nurse/Admin | Pre-consultation vitals recording |
| OPD_SLOT_CONFIG | Config | Admin | OPD capacity configuration per department |
| CONSULTING_SCHEDULE | Config | Doctor | Weekly recurring availability |
| DOCTOR_LEAVE | Transactional | Doctor, Admin | Leave management with approval workflow |
| SCHEDULE_OVERRIDE | Config | Admin | One-time schedule modifications |
| WARD | Reference | Admin | Hospital wards/units |
| BED | Reference | Admin | Individual bed tracking |
| BED_ALLOCATION | Transactional | Admin | Patient admission to bed |
| BED_TRANSFER | Transactional | Admin | Inter-bed/ward transfers |
| INVENTORY_CATEGORY | Reference | Admin | Supply categorization |
| INVENTORY_ITEM | Reference | Admin | Stock-tracked supplies |
| MEDICINE | Reference | Admin, Pharmacist | Medication inventory with expiry |
| INVENTORY_TRANSACTION | Transactional | Admin | Stock in/out logging |
| EQUIPMENT | Reference | Admin | Hospital equipment registry |
| EQUIPMENT_BOOKING | Transactional | Doctor | Equipment reservation |
| MEDICAL_RECORD | Transactional | Doctor | Per-visit clinical documentation |
| PRESCRIPTION | Transactional | Doctor | Medication orders |
| PRESCRIPTION_ITEM | Detail | Doctor | Individual medicine in prescription |
| LAB_REPORT | Transactional | Doctor | Lab test orders and results |
| ALLERGY | Reference | Doctor, Patient | Patient allergy registry |
| VITAL_READING | Transactional | Nurse/Doctor | Patient vital signs over time |
| INVOICE | Transactional | Admin | Billing documents |
| INVOICE_ITEM | Detail | Admin | Line items per invoice |
| PAYMENT | Transactional | Patient | Payment transactions |
| INSURANCE | Reference | Patient | Insurance policy info |
| MESSAGE | Transactional | Public | Contact form submissions |
| NOTIFICATION | Transactional | System | User notifications |
| REVIEW | Transactional | Patient | Doctor ratings and feedback |
| ANNOUNCEMENT | Transactional | Admin | Hospital-wide notices |
| VIDEO_SESSION | Transactional | Doctor, Patient | Telemedicine video calls |
| AUDIT_LOG | System | All | Immutable change tracking |

**Total Entities: 36**

## Role-Entity Access Matrix

| Entity | Patient | Doctor | Admin | SuperAdmin |
|--------|---------|--------|-------|------------|
| USER | R (own) | R (own) | CRUD | CRUD |
| DOCTOR_PROFILE | R | R/U (own) | CRUD | CRUD |
| DEPARTMENT | R | R | CRUD | CRUD |
| APPOINTMENT | CR (own) | RU (assigned) | CRUD | CRUD |
| OPD_BOOKING | CR (own) | RU (assigned) | CRUD | CRUD |
| OPD_TRIAGE | R (own) | CR | CRUD | CRUD |
| CONSULTING_SCHEDULE | R | RU (own) | CRUD | CRUD |
| DOCTOR_LEAVE | - | CR (own) | RU | CRUD |
| WARD | R | R | CRUD | CRUD |
| BED | R | R | CRUD | CRUD |
| BED_ALLOCATION | R (own) | R | CRUD | CRUD |
| INVENTORY_ITEM | - | R | CRUD | CRUD |
| MEDICINE | - | R | CRUD | CRUD |
| INVENTORY_TRANSACTION | - | - | CRUD | CRUD |
| EQUIPMENT | - | R | CRUD | CRUD |
| EQUIPMENT_BOOKING | - | CR | CRUD | CRUD |
| MEDICAL_RECORD | R (own) | CRUD | R | CRUD |
| PRESCRIPTION | R (own) | CRUD | R | CRUD |
| LAB_REPORT | R (own) | CRUD | R | CRUD |
| ALLERGY | R (own) | CRUD | R | CRUD |
| VITAL_READING | R (own) | CR | CR | CRUD |
| INVOICE | R (own) | - | CRUD | CRUD |
| PAYMENT | CR (own) | - | CRUD | CRUD |
| INSURANCE | RU (own) | R | CRUD | CRUD |
| MESSAGE | C | - | R | CRUD |
| NOTIFICATION | R (own) | R (own) | CRUD | CRUD |
| REVIEW | CR (own) | R (own) | CRUD | CRUD |
| VIDEO_SESSION | R (own) | RU | CRUD | CRUD |
| AUDIT_LOG | - | - | R | CRUD |

**Legend:** C=Create, R=Read, U=Update, D=Delete
