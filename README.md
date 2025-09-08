# 📑 Facturation App

A full-stack billing and invoicing web application built with **Next.js 15**, **React 19**, **TailwindCSS**, and **Supabase**.  
It provides authentication, client and invoice management, PDF export, currency conversion, and dashboards with charts.

---

## ✨ Features

- 🔐 **Authentication & Security**
  - User login & registration (Supabase + JWT)
  - Role-based access (admin, accountant, user)
  - Password hashing with `bcryptjs`

- 👥 **Client Management**
  - Add, edit, delete, and search clients
  - View client details and history

- 💰 **Invoice Management**
  - Create and update invoices
  - Export invoices as **PDF** (via `jspdf` + `html2canvas`)
  - Currency converter for prices
  - Payment status tracking (paid / pending / overdue)

- 📊 **Dashboard**
  - Interactive charts with **Recharts**
  - Key metrics (total revenue, pending payments, client stats)

- 🌍 **Internationalization**
  - Multi-language support with `next-intl`
  - Translations stored in `/messages`

- 🎨 **Modern UI**
  - Built with **Radix UI** + **TailwindCSS**
  - Icons with `lucide-react`
  - Dark/Light theme via `next-themes`
  - Notifications (`react-toastify`, `sonner`) + sounds (`use-sound`)

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Frontend**: React 19 + TailwindCSS + Radix UI
- **Backend**: Next.js API Routes
- **Database & Auth**: Supabase
- **Forms & Validation**: React Hook Form + Zod
- **PDF Export**: jsPDF + html2canvas
- **Charts**: Recharts
- **Internationalization**: next-intl

---

## 📂 Project Structure

```bash
├── app/                # App Router (routes, layouts, pages)
├── components/         # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utilities (auth, DB, validations)
├── messages/           # Translations for i18n
├── public/             # Static assets (images, fonts, etc.)
├── scripts/            # Internal scripts (migrations, seeds, etc.)
├── services/           # API logic & business rules
├── styles/             # Global styles (Tailwind configs)
│
├── next.config.js      # Next.js configuration
├── tailwind.config.ts  # TailwindCSS configuration
├── package.json        # Dependencies & scripts
└── README.md           # Project documentation
```

---

## ⚡ Installation & Setup

### 1️⃣ Clone the project
```bash
git clone https://github.com/your-username/facturation-app.git
cd facturation-app
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Configure environment variables  
Create a `.env.local` file at the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# JWT
JWT_SECRET=your_secret_key

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4️⃣ Run the development server
```bash
npm run dev
```

➡️ Open [http://localhost:3000](http://localhost:3000)

---

## 📜 Scripts

- `npm run dev` → Start development server  
- `npm run build` → Build for production  
- `npm start` → Run production server  
- `npm run lint` → Run linter  

---

## 📡 API Endpoints (Examples)

### Authentication
- `POST /api/auth/register` → Register new user  
- `POST /api/auth/login` → Login user  

### Clients
- `GET /api/clients` → List all clients  
- `POST /api/clients` → Create client  
- `PUT /api/clients/:id` → Update client  
- `DELETE /api/clients/:id` → Delete client  

### Invoices
- `GET /api/invoices` → List invoices  
- `POST /api/invoices` → Create invoice  
- `PUT /api/invoices/:id` → Update invoice  
- `DELETE /api/invoices/:id` → Delete invoice  

---

## 🏗️ Architecture Overview

```txt
[Frontend: Next.js + React] 
        |
        v
[API Routes in Next.js] ----> [Supabase: Database + Auth]
        |
        v
  [Services + Business Logic]
```

- **Frontend (React + Tailwind)** → Handles UI and user interaction  
- **Backend (Next.js API Routes)** → Processes requests (auth, clients, invoices)  
- **Supabase** → Provides database and authentication  
- **PDF & Charts** → Generated on the client side  

---
