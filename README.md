# 📦 LogiPulse | Logistics & Courier Management System

A state-of-the-art, fullstack enterprise web application built for real-time freight tracking, express priority courier dispatching, role-based authorization, dynamic multi-facet filtering, and cloud deployment.

![Logistics Dashboard](https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

- 🔐 **Authentication & Authorization**:
  - JWT Session tokens & Password hashing with `bcryptjs`.
  - Roles: `Admin`, `Dispatcher`, and `Customer`.
  - Demo accounts with pre-loaded dispatch permissions.
- 📦 **Shipment CRUD Operations**:
  - **Create**: Detailed waybill wizard (`LGP-XXXXXX` tracking ID auto-generator, sender/recipient info, package category, weight in kg, carrier selection, priority level).
  - **Read**: Interactive table and card views with live milestone status.
  - **Update**: Edit shipment info, adjust delivery estimates, and trigger inline status transitions (*Pending, Picked Up, In Transit, Out for Delivery, Delivered, Exception*).
  - **Delete**: Soft/hard removal with verification modals.
- ⚡ **Priority Express Shipments Engine**:
  - Dedicated **Priority Hub** for urgent cold-chain medical supplies, semiconductor wafers, and SLA-critical shipments.
  - Glowing pulse indicators, route rush badges, and instant priority elevation toggle.
- 🔍 **Real-Time Search & Filtering**:
  - Instant fuzzy search across waybill IDs, recipient names, sender names, cities, and courier partners.
  - Multi-facet status and priority filters with instant UI response.
- 📍 **Public Waybill Tracker**:
  - Public lookup portal allowing users to track any waybill number and view full milestone history logs.
- 🌐 **Deployment & Production Ready**:
  - Unified Express backend serving built Vite React assets.
  - Single command startup (`npm start`).
  - Out-of-the-box support for Vercel, Render, Railway, and Docker.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Custom CSS Design System with Glassmorphism, Google Fonts (`Outfit` & `Inter`).
- **Backend**: Node.js, Express.js REST API.
- **Database**: SQLite with automatic schema creation and data seeding.
- **Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs` password encryption, CORS protection.

---

## 🚀 Quick Start (Local Run)

### 1. Clone or Open Project
```bash
cd logistics-courier-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Environment
Runs Express server on port `5000` and Vite dev server on port `3000` concurrently with proxying:
```bash
npm run dev
```

Open your browser at `http://localhost:3000`.

### 4. Build & Run Production Bundle Locally
```bash
npm run build
npm start
```

Open your browser at `http://localhost:5000`.

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@logipulse.com` | `admin123` |
| **Dispatcher** | `dispatcher@logipulse.com` | `dispatch123` |

---

## 📡 API Endpoints Reference

### Auth Routes (`/api/auth`)
- `POST /api/auth/signup` - Register new account.
- `POST /api/auth/login` - Login & return JWT token.
- `GET /api/auth/me` - Return current logged-in user.

### Shipment Routes (`/api/shipments`)
- `GET /api/shipments` - Retrieve shipments (Supports `?search=`, `?status=`, `?priorityOnly=true`).
- `POST /api/shipments` - Create new shipment (Protected).
- `GET /api/shipments/:id` - Fetch shipment details & timeline history.
- `GET /api/shipments/track/:trackingNumber` - Public waybill lookup.
- `PUT /api/shipments/:id` - Full update shipment record (Protected).
- `PATCH /api/shipments/:id/status` - Quick status transition update (Protected).
- `PATCH /api/shipments/:id/priority` - Toggle priority express flag (Protected).
- `DELETE /api/shipments/:id` - Delete shipment (Protected).

### System Stats (`/api/stats`)
- `GET /api/stats/overview` - Dashboard summary stats & SLA rates.

---

## 📤 Push to your GitHub Repository

Run the automated helper script inside the project folder:
```bash
chmod +x setup-github.sh
./setup-github.sh
```

Or execute standard git commands manually:
```bash
git init -b main
git add .
git commit -m "Initial commit: Logistics and Courier Management System"
git remote add origin https://github.com/YOUR_USERNAME/logistics-courier-app.git
git push -u origin main
```

---

## ☁️ Cloud Deployment Instructions

### Option 1: Deploy on Render
1. Push your code to GitHub.
2. Log into [Render.com](https://render.com) and click **New > Blueprint**.
3. Connect your GitHub repository. Render will automatically detect `render.yaml` and deploy your app.

### Option 2: Deploy on Vercel
1. Install Vercel CLI or import repository directly on [Vercel.com](https://vercel.com).
2. Use default build command `npm run build` and output directory `dist`. `vercel.json` will route API calls automatically.

---

# 📦 LogiPulse | Logistics & Courier Management System - 
Deployed Link : [Live Demo](https://logistics-courier-management.vercel.app/)

---
## 📄 License
MIT License © 2026 LogiPulse Systems.
