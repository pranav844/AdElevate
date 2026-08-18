# 🚀 AdElevate — Full-Stack Multi-Service Ad Marketplace

AdElevate is an end-to-end, multi-service advertising marketplace platform where business vendors can subscribe to tiered promotion plans (Platinum, Gold, Silver), create and manage rich advertisement listings, process digital payments through a dedicated microservice, and track performance analytics. Customers can discover categorized products/services across locations and leave verified ratings and reviews.

---

## 🏛️ Project Architecture

```
AdElevate/
├── backend/                               ← Multi-Service Backend Layer
│   ├── src/                               ← Spring Boot 3 Core Backend (Port 9090)
│   │   └── main/java/com/adelevate/
│   │       ├── controllers/               ← 10 REST Controllers (44 API Endpoints)
│   │       ├── services/                  ← Business Logic Layer (8 Service Pairs)
│   │       ├── entities/                  ← 9 JPA Entities (MySQL Database Mapping)
│   │       ├── repositories/              ← Spring Data JPA with Custom JPQL Queries
│   │       ├── securityConfig/            ← Spring Security & JWT Authentication
│   │       ├── clients/                   ← Cross-Service HTTP Integration
│   │       ├── dtos/                      ← Data Transfer Objects
│   │       └── exception/                 ← Centralized @ControllerAdvice Error Handling
│   │
│   ├── payment_service/                   ← Spring Boot Payment Microservice (Port 8081)
│   │   └── src/                           ← Razorpay Orders & Transaction Webhooks
│   │
│   └── logger_service/                    ← ASP.NET Core Logger Microservice (Port 5085)
│       ├── Controllers/                   ← Centralized Audit Logging (/api/logs)
│       └── Models/                        ← Structured Log Models
│
└── frontend/                              ← React SPA with Vite & Tailwind/Vanilla CSS
    ├── src/
    │   ├── pages/                         ← 7 Core Page Views (Marketplace, Profile, Dashboards)
    │   ├── components/                    ← 11 Reusable Components (Hero, Cards, Modals)
    │   └── services/                      ← Axios API Client & JWT Interceptors
    └── package.json
```

---

## 🛠️ Technology Stack

### Frontend:
- **React 18 + Vite** (High-performance Single Page Application)
- **React Router v7** (Client-side routing with role-based `<ProtectedRoute>`)
- **Axios** (Dual-instance HTTP client with auto-injecting JWT interceptors)
- **HTML5 Canvas Auto-Compression** (Client-side image resizing to ~12KB Base64)
- **Razorpay SDK** (Integrated digital payment gateway)

### Backend & Microservices:
- **Java 17 / 21 + Spring Boot 3** (REST API core backend on Port 9090)
- **Spring Boot Payment Microservice** (Transactional payment handling on Port 8081)
- **C# / ASP.NET Core Web API** (Centralized logging microservice on Port 5085)
- **Spring Security 6 + JWT (HMAC-SHA256)** (Stateless token-based authorization)
- **Spring Data JPA / Hibernate** (Shared Primary Keys via `@MapsId`, custom JPQL)
- **MySQL 8** (Relational database with soft-delete patterns)

---

## 🌟 Key Highlights & Features

1. **Role-Based Access Control (RBAC)**:
   - **`ADMIN`**: Ad moderation approval queue (1-Click Approve/Reject), plan management, analytics metrics.
   - **`VENDOR`**: Post ads with dual-mode media upload (Web URL / Local Canvas compression), subscription tier selection, vendor dashboard.
   - **`CUSTOMER`**: Public marketplace browsing, city/category multi-filter, interactive 5-star reviews and ratings.

2. **Algorithmic Feed Ranking**:
   - Ads are algorithmically ordered by subscription priority: `PLATINUM (3)` ➔ `GOLD (2)` ➔ `SILVER (1)`.

3. **Multi-Service Centralized Logging**:
   - Cross-language integration with an **ASP.NET Core Web API** microservice (Port 5085) streaming audit logs for security, ad moderation, and exception traces.

4. **Decoupled Payment Microservice**:
   - Isolated payment processing microservice on Port 8081 communicating with the core engine and Razorpay gateway.

5. **Synchronous Session Resilience**:
   - Instant auth state hydration directly from storage on initial render, preventing redirect flashes.

---

## 🚀 Getting Started

### 1. Prerequisites
- Java 17+ & Maven
- Node.js 18+ & npm
- .NET 8 / 10 SDK
- MySQL 8 (Running on port 3307 or 3306)

---

### 2. Core Backend Setup (Spring Boot)
```bash
cd backend
./mvnw clean spring-boot:run
```
*Server will start on **`http://localhost:9090`**.*

---

### 3. Payment Microservice Setup (Spring Boot)
```bash
cd backend/payment_service
./mvnw clean spring-boot:run
```
*Payment service will start on **`http://localhost:8081`**.*

---

### 4. .NET Logger Microservice Setup
```bash
cd backend/logger_service
dotnet run
```
*Logger service will start on **`http://localhost:5085`**.*

---

### 5. Frontend Setup (React)
```bash
cd frontend
npm install
npm run dev
```
*Vite Dev Server will launch on **`http://localhost:5173`**.*

---

## 👨‍💻 Author & Contribution
- **Author**: Pranav Saxena
- **Repository**: [https://github.com/pranav844/AdElevate](https://github.com/pranav844/AdElevate)
