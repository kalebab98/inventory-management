# Apex Inventory - Enterprise Asset & Inventory Management System

A high-performance, enterprise-tier web application for tracking physical assets, facility equipment, consumables inventory, maintenance workflows, warranties, and deployment audits.

Built with **Next.js (App Router)**, **Tailwind CSS**, and **Supabase (PostgreSQL)**, adhering to modern UI/UX design standards inspired by Linear, Stripe, and Atlassian Assets.

---

## 🚀 Key Highlights & Modules

- **Asset Lifecycle Registry**: Serialized hardware, electronics, appliances, and fixtures cataloged with unique barcodes (`BAR-AST-1001`), serial tags, valuation, and condition tracking.
- **Facility & Deployment Tracking**: Track assets assigned to active facilities, operational zones, and central storage depots (without residential apartment constraints).
- **Consumables & Parts Inventory**: Real-time SKU stock tracking, minimum safety thresholds, reorder alerts, and supplier linkages.
- **Maintenance & Work Orders**: Dispatched work orders, priority triage (Urgent, High, Medium, Low), SLA resolution times, and technician assignment.
- **Warranty & Vendor Contracts**: Active service level agreements, expiration calendars, claim workflows, and vendor contacts.
- **Cloud Database Integration (Supabase)**: Live connection with PostgreSQL backend, resilient local fallback caching, and automatic audit replication.
- **Modern Login & 1-Click Demo Entry**: Instant guest/demo access button for reviewers (no password required) plus role-based access control (Administrator, Inventory Officer, Maintenance Staff, Auditor).

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL 15+) with `@supabase/supabase-js`
- **Styling**: Vanilla Tailwind CSS with custom design tokens (single-accent Cobalt Blue `#0052CC` / `#2563EB`, bone/slate surfaces, and semantic indicators)
- **Typography**: Google Fonts `Plus Jakarta Sans` for UI headings/labels and `JetBrains Mono` for tabular numbers, serial tags, currency (`ETB`), and barcodes
- **Icons**: `lucide-react`
- **Telemetry Charts**: `recharts`

---

## ⚡ Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kalebab98/inventory-management.git
cd inventory-management
npm install
```

### 2. Environment Configuration
Create a `.env.local` file based on `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_anon_key
NEXT_PUBLIC_APP_NAME="Apex Enterprise Asset & Inventory Management"
NEXT_PUBLIC_DEFAULT_CURRENCY="ETB"
```

### 3. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🔐 Authentication & Demo Access

The application includes an instant 1-click login method designed for immediate testing:
- Visit `/login`
- Click **"⚡ 1-Click Instant Demo Login"** to immediately sign in as **Administrator**.
- Or click any of the persona pills (Inventory Officer, Maintenance Staff, Auditor) to test distinct permissions and views.
- To sign out, open the user profile dropdown in the top bar and click **"Sign Out"**.

---

## 🗄️ Database & Supabase Schema

The SQL schema definitions for PostgreSQL and Supabase are located in [`supabase/schema.sql`](./supabase/schema.sql), providing complete table DDL for:
- `company_settings`
- `roles`, `permissions`, `role_permissions`
- `users`
- `locations`
- `asset_categories`, `assets`
- `inventory_items`, `suppliers`
- `maintenance_requests`, `maintenance_work_orders`
- `inspections`, `damage_reports`
- `audit_logs`

---

## 📄 License

Proprietary & Confidential • Developed for Apex Enterprise Asset Management.
