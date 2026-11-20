# FEST - NCC Fest Registration & Management Platform

**FEST** is an event management and registration platform purpose-built for NCC (National Cadet Corps) state and national fests. It features event discovery, division-based registrations (SD, SW, JD, JW), institution-level quota enforcement, Razorpay payment processing, and JWT-signed QR digital passes with scanner support.

---

## ⚡ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, CSS animations
- **Animations**: Framer Motion
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth, Storage)
- **Payments**: [Razorpay](https://razorpay.com/) (Payment Links / Orders, Webhook signature verification)
- **QR Code & Verification**: `qrcode` (generation), `html5-qrcode` (camera scanning), `jsonwebtoken` (tamper-proof pass signing)

---

## 🌟 Key Features

- **Event Discovery & Multi-Division Logic**:
  - Filter events by division: **SD** (Senior Division), **SW** (Senior Wing), **JD** (Junior Division), **JW** (Junior Wing).
  - Support for individual and team events with member limits.
  - Automated institution quota restrictions (e.g., 1 team per institution/division).
- **Secure Authentication & RBAC**:
  - Google OAuth and Email magic links via Supabase Auth.
  - Role-based routing and middleware protection (`user`, `volunteer`, `admin`).
- **Seamless Razorpay Checkout**:
  - Order generation, checkout modal, and automated webhook verification for payment confirmation.
- **QR Digital Pass & Scanner**:
  - Tamper-proof, cryptographically signed JWT QR codes generated for valid registrations.
  - Volunteer scanning portal using device camera (`/volunteer`) for instant attendance check-ins.
- **Admin Control Center**:
  - Live analytics, payment verification, manual overrides, institution management, and event creation/editing (`/admin`).

---

## 📁 Project Structure

```text
FEST/
├── sql/
│   └── get_my_role.sql          # Helper function for middleware role inspection
├── src/
│   ├── app/
│   │   ├── actions/             # Server actions (registrations, payments, profiles)
│   │   ├── admin/               # Admin panel (events, users, stats, approvals)
│   │   ├── api/                 # API routes (Razorpay webhooks, QR verification)
│   │   ├── auth/                # Auth callbacks and sign-in routes
│   │   ├── dashboard/           # Cadet dashboard (registered events, digital passes)
│   │   ├── events/              # Event catalog and detail pages
│   │   ├── register/            # Multi-step registration flow
│   │   ├── volunteer/           # On-field QR code scanner & desk check-in
│   │   ├── layout.tsx           # Root layout with site metadata & fonts
│   │   └── page.tsx             # Landing page with marquee gallery & countdown
│   ├── components/              # Shared UI components (Navbar, Modals, QR cards)
│   ├── lib/                     # Utilities (Supabase client/server, Razorpay, QR auth)
│   └── middleware.ts            # Route protection and role enforcement
├── .env.example                 # Template for required environment variables
├── supabase_schema.sql          # Core PostgreSQL tables, enums, triggers, and RLS
├── next.config.mjs              # Next.js build & tree-shaking configuration
├── package.json
└── tailwind.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have installed:
- [Node.js](https://nodejs.org/) (v18.17.0 or later recommended)
- [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), or [yarn](https://yarnpkg.com/)
- A free [Supabase](https://supabase.com/) account
- A [Razorpay](https://razorpay.com/) account (Test mode works for development)

---

### Step 1: Install Dependencies

From the project root:

```bash
npm install
```

---

### Step 2: Configure Environment Variables

Duplicate `.env.example` as `.env`:

```bash
cp .env.example .env
```

Open `.env` and provide your credentials:

```env
# Supabase (Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay (Dashboard > Settings > API Keys & Webhooks)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_signing_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx

# QR Code JWT Signing (Generate a random 32+ character string)
QR_JWT_SECRET=super_secret_jwt_random_key_min_32_chars
```

---

### Step 3: Setup Supabase Database

1. Open your project on the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** -> **New query**.
3. Copy and execute the contents of [`supabase_schema.sql`](./supabase_schema.sql). This sets up:
   - Custom enums (`division_type`, `user_role`, `payment_status`, etc.)
   - Tables (`ncc_groups`, `battalions`, `institutions`, `events`, `registrations`, `profiles`, `app_settings`)
   - Triggers for user creation and institution quota checks
   - Row Level Security (RLS) policies
4. In the SQL Editor, execute the contents of [`sql/get_my_role.sql`](./sql/get_my_role.sql) to grant the Next.js middleware permission to read user roles efficiently.

---

### Step 4: Configure Supabase Storage

1. Go to **Storage** on the Supabase Dashboard.
2. Create the following two buckets:
   - `event-posters` (Set **Public bucket**: **ON**)
   - `profile-photos` (Set **Public bucket**: **ON**)
3. Under **Storage Policies**, ensure public read access is enabled (`SELECT`) and authenticated users can upload (`INSERT`).

---

### Step 5: Configure Supabase Authentication

1. Go to **Authentication** -> **Providers** -> **Google** (or Email).
2. Enable Google Auth and add your `Google Client ID` and `Google Client Secret` from Google Cloud Console.
3. Add the redirect URL:
   - Local: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`
4. Set the Site URL under **URL Configuration** to `http://localhost:3000`.

---

### Step 6: Create an Admin User

By default, every newly registered user receives the `user` role. To make an account an administrator:

1. Sign up once through the website (or create a user in Supabase Auth).
2. In Supabase Dashboard -> **Table Editor** -> **profiles**.
3. Locate your user record and update the `role` column to `'admin'`.
4. You now have access to `/admin`.

---

### Step 7: Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js local development server (with Turbopack/Hot-Reload) |
| `npm run build` | Builds an optimized production bundle in `.next` |
| `npm run start` | Runs the production build server |
| `npm run lint` | Runs ESLint check across all TypeScript/JavaScript files |

---

## 🛡️ License

This project is created for the National Cadet Corps (NCC) Annual Fest — **FEST**. All rights reserved.
