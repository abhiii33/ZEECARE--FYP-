# ZeeCare Hospital Management System — Architecture Diagram

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        PA[Patient Portal<br/>Next.js 14 + shadcn/ui]
        AD[Admin Dashboard<br/>Next.js 14 + shadcn/ui]
        MA[Mobile App<br/>React Native / PWA]
    end

    subgraph "CDN & Edge"
        CF[Cloudflare CDN]
        VER[Vercel Edge Network]
    end

    subgraph "API Gateway"
        NG[Nginx Reverse Proxy<br/>Rate Limiting + SSL]
    end

    subgraph "Application Layer"
        subgraph "Next.js Server"
            SSR[Server-Side Rendering]
            API_R[API Route Handlers]
            MW[Middleware<br/>Auth + RBAC]
        end

        subgraph "Express.js Backend"
            REST[REST API v1]
            AUTH[Auth Service<br/>JWT + bcrypt]
            APPT[Appointment Service]
            USR[User Service]
            MSG[Message Service]
            NOTIF[Notification Service]
            BILL[Billing Service]
            INV[Inventory Service]
            BED[Bed Management Service]
            OPD[OPD Queue Service]
        end
    end

    subgraph "Data Layer"
        MONGO[(MongoDB<br/>Primary Database)]
        REDIS[(Redis<br/>Cache + Sessions + Queues)]
    end

    subgraph "External Services"
        CLD[Cloudinary<br/>Image Storage]
        SMTP[SMTP Server<br/>Email Notifications]
        SMS[Twilio / MSG91<br/>SMS Alerts]
        PAY[Razorpay / Stripe<br/>Payment Gateway]
        MEET[Jitsi / Twilio Video<br/>Telemedicine]
    end

    subgraph "DevOps & Monitoring"
        DOCK[Docker Containers]
        K8S[Kubernetes / Docker Compose]
        PROM[Prometheus + Grafana<br/>Monitoring]
        LOG[ELK Stack<br/>Logging]
    end

    PA --> VER --> NG
    AD --> VER --> NG
    MA --> NG
    NG --> SSR
    NG --> REST
    SSR --> API_R --> REST
    REST --> AUTH
    REST --> APPT
    REST --> USR
    REST --> MSG
    REST --> NOTIF
    REST --> BILL
    REST --> INV
    REST --> BED
    REST --> OPD
    AUTH --> MONGO
    APPT --> MONGO
    USR --> MONGO
    MSG --> MONGO
    NOTIF --> REDIS
    BED --> MONGO
    INV --> MONGO
    OPD --> REDIS
    USR --> CLD
    NOTIF --> SMTP
    NOTIF --> SMS
    BILL --> PAY
    APPT --> MEET
    REST --> REDIS
```

## Deployment Architecture

```mermaid
graph LR
    subgraph "Production"
        subgraph "Frontend Tier"
            V1[Vercel / AWS Amplify]
        end
        subgraph "Backend Tier"
            EC2A[EC2 Instance A<br/>Express API]
            EC2B[EC2 Instance B<br/>Express API]
            ALB[Application Load Balancer]
        end
        subgraph "Database Tier"
            MDB[MongoDB Atlas<br/>Replica Set]
            RDB[ElastiCache Redis]
        end
        subgraph "Storage"
            S3[AWS S3 / Cloudinary<br/>Files & Images]
        end
    end

    V1 --> ALB
    ALB --> EC2A
    ALB --> EC2B
    EC2A --> MDB
    EC2B --> MDB
    EC2A --> RDB
    EC2B --> RDB
    EC2A --> S3
    EC2B --> S3
```

## Request Flow (Appointment Booking)

```mermaid
sequenceDiagram
    participant P as Patient
    participant FE as Next.js Frontend
    participant MW as Auth Middleware
    participant API as Express API
    participant DB as MongoDB
    participant N as Notification Service
    participant E as Email/SMS

    P->>FE: Fill appointment form
    FE->>FE: Client-side validation (Zod)
    FE->>API: POST /api/v1/appointment/post
    API->>MW: Verify JWT Token
    MW-->>API: User authenticated (Patient role)
    API->>DB: Check doctor availability
    DB-->>API: Doctor schedule data
    API->>DB: Check for conflicts
    DB-->>API: No conflicts found
    API->>DB: Create appointment (status: Pending)
    DB-->>API: Appointment created
    API->>N: Trigger notifications
    N->>E: Send email to patient
    N->>E: Send SMS to patient
    N->>E: Send notification to doctor
    API-->>FE: 200 OK + appointment data
    FE-->>P: Success toast + redirect
```

## Role-Based Access Control (RBAC)

```mermaid
graph TB
    subgraph "Roles"
        ADMIN[Admin]
        DOC[Doctor]
        PAT[Patient]
        SUPER[Super Admin]
    end

    subgraph "Admin Permissions"
        A1[Manage Doctors]
        A2[Manage Appointments]
        A3[View Messages]
        A4[Add Admin]
        A5[Manage Beds & Wards]
        A6[Manage Inventory]
        A7[View Analytics]
        A8[Manage Billing]
        A9[System Settings]
    end

    subgraph "Doctor Permissions"
        D1[View Own Schedule]
        D2[Accept/Reject Appointments]
        D3[Manage Consulting Hours]
        D4[Write Prescriptions]
        D5[View Patient Records]
        D6[Start Telemedicine Call]
        D7[Update OPD Status]
        D8[Order Lab Tests]
    end

    subgraph "Patient Permissions"
        P1[Book Appointment]
        P2[Book OPD Slot]
        P3[View Own Profile]
        P4[View Health Records]
        P5[Send Message]
        P6[Rate Doctors]
        P7[Join Telemedicine Call]
        P8[View Billing & Payments]
        P9[Download Prescriptions]
    end

    SUPER --> ADMIN
    ADMIN --> A1 & A2 & A3 & A4 & A5 & A6 & A7 & A8 & A9
    DOC --> D1 & D2 & D3 & D4 & D5 & D6 & D7 & D8
    PAT --> P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9
```
