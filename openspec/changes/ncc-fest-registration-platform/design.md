# Design

## Context

See `proposal.md — Why` for motivation. This is a greenfield full-stack web application with no existing codebase. The platform must handle concurrent registrations reliably, enforce complex eligibility and institution-restriction rules at the database level, integrate with Razorpay for payment, and serve a mobile-friendly UI to cadets who will access it on phones at the fest venue.

## Goals / Non-Goals

**Goals:**
- Full-stack web app using Next.js 14 and Supabase (Postgres, Auth, Storage)
- Strict institution-restriction enforcement using DB triggers and conditional unique constraints
- Supabase Auth supporting Email/Password and Google OAuth with profile extension
- Razorpay integration: order creation, webhook verification, manual fallback
- Signed-token QR system readable by an in-app camera scanner
- Role-based routing (Admin / Volunteer / User) across frontend, API, and database (RLS)
- Mobile-first responsive UI

**Non-Goals:**
- Native mobile app (PWA is acceptable for scanner, no App Store release)
- Real-time seat countdown / event capacity limits (not requested)
- Result entry / scoring system (this platform is registration-only)
- Multi-fest / multi-year support in V1

---

## Decisions

### 1. Tech Stack

| Layer | Choice | Why over alternatives |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR for public event pages (SEO, fast first paint), RSC for server components, single repo for all roles | 
| Backend | Next.js API Routes / Route Handlers | Colocated with frontend, leverages Supabase Server Client & Service Role |
| Database | Supabase (PostgreSQL) | Managed PostgreSQL with built-in connection pooling, extensions, RLS, and triggers |
| ORM | Prisma | Type-safe schema, migrations, easy to reason about complex relations with Supabase Postgres |
| Auth | Supabase Auth (`@supabase/ssr`) | Native Email/Password and Google OAuth handling; synchronises with `auth.users` and custom `profiles` |
| File Storage | Supabase Storage | Dedicated storage buckets (`event-posters`, `profile-photos`) with security policies |
| Payments | Razorpay Node SDK | Official SDK; webhook support; manual fetch API for admin verify |
| QR Generation | `qrcode` npm package | Compact, well-maintained; generates PNG/SVG |
| QR Scanning | `html5-qrcode` or `@zxing/browser` | Camera-based in-browser scanner; works smoothly on mobile web/PWA |
| Hosting | Vercel / Railway / Render | First-class Next.js support, connecting directly to Supabase cloud instance |

---

### 2. Complete Database Schema (Supabase PostgreSQL)

```sql
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE division_type       AS ENUM ('SD', 'SW', 'JD', 'JW');
CREATE TYPE participation_type  AS ENUM ('individual', 'team');
CREATE TYPE inst_restriction    AS ENUM ('none', 'per_institution', 'per_division');
CREATE TYPE division_inst_status AS ENUM ('active', 'below_threshold', 'cancelled');
CREATE TYPE payment_status      AS ENUM ('pending', 'verified', 'failed');
CREATE TYPE user_role           AS ENUM ('admin', 'volunteer', 'user');

-- ============================================================
-- INSTITUTION HIERARCHY
-- ============================================================
CREATE TABLE ncc_groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE battalions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID NOT NULL REFERENCES ncc_groups(id) ON DELETE RESTRICT,
  name          TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, name)
);

CREATE TABLE institutions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battalion_id  UUID NOT NULL REFERENCES battalions(id) ON DELETE RESTRICT,
  name          TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(battalion_id, name)
);

-- ============================================================
-- USER PROFILES (Extends auth.users from Supabase Auth)
-- ============================================================
CREATE TABLE profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            TEXT NOT NULL,
  display_name     TEXT,
  phone            TEXT,
  division         division_type,
  institution_id   UUID REFERENCES institutions(id),
  ncc_unit         TEXT,
  photo_url        TEXT,
  profile_complete BOOLEAN DEFAULT FALSE,
  role             user_role DEFAULT 'user',
  division_locked  BOOLEAN DEFAULT FALSE,  -- set TRUE upon first registration
  qr_token         TEXT UNIQUE,            -- signed JWT for QR ticket
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sub_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name          TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, name)
);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE events (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id          UUID NOT NULL REFERENCES sub_categories(id) ON DELETE RESTRICT,
  title                   TEXT NOT NULL,
  description             TEXT,
  poster_url              TEXT,
  rules_content           TEXT,          -- rich text / markdown
  event_date              DATE,
  event_time              TIME,
  venue                   TEXT,
  fee                     NUMERIC(10,2) NOT NULL DEFAULT 0,
  participation_type      participation_type NOT NULL,
  eligible_divisions      division_type[] NOT NULL,
  team_min                INT,           -- NULL for individual
  team_max                INT,
  team_fixed              BOOLEAN DEFAULT FALSE,
  institution_restriction inst_restriction DEFAULT 'none',
  conflict_alert_enabled  BOOLEAN DEFAULT FALSE,
  is_active               BOOLEAN DEFAULT TRUE,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Parallel event links (ordered pair ensures uniqueness)
CREATE TABLE parallel_event_links (
  event_a_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  event_b_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  PRIMARY KEY (event_a_id, event_b_id),
  CHECK (event_a_id < event_b_id)
);

-- Prize pool groups per event
CREATE TABLE prize_pool_groups (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  divisions  division_type[] NOT NULL,
  prize_1st  NUMERIC(10,2),
  prize_2nd  NUMERIC(10,2),
  prize_3rd  NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DIVISION INSTANCES
-- ============================================================
CREATE TABLE event_division_instances (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  division      division_type NOT NULL,
  min_threshold INT DEFAULT 0,
  status        division_inst_status DEFAULT 'active',
  cancel_reason TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, division)
);

-- ============================================================
-- REGISTRATIONS
-- ============================================================
CREATE TABLE registrations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  leader_id           UUID NOT NULL REFERENCES profiles(id),
  team_name           TEXT,                          -- NULL for individual
  participation_type  participation_type NOT NULL,
  division            division_type NOT NULL,         -- leader's division
  institution_id      UUID REFERENCES institutions(id),
  payment_status      payment_status DEFAULT 'pending',
  razorpay_order_id   TEXT UNIQUE,
  razorpay_payment_id TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Team members (leader always included with role='leader')
CREATE TABLE registration_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id),
  role            TEXT NOT NULL CHECK (role IN ('leader', 'member')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(registration_id, user_id)
);

-- App-wide settings
CREATE TABLE app_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3. Institution Restriction Enforcement (Trigger & DB Guard)

To handle race conditions under simultaneous team registrations, PostgreSQL trigger logic enforces institution restrictions:

```sql
CREATE OR REPLACE FUNCTION check_institution_restriction()
RETURNS TRIGGER AS $$
DECLARE
  restriction inst_restriction;
  conflict_count INT;
BEGIN
  SELECT institution_restriction INTO restriction
  FROM events WHERE id = NEW.event_id;

  IF restriction = 'per_division' THEN
    SELECT COUNT(*) INTO conflict_count
    FROM registrations
    WHERE event_id       = NEW.event_id
      AND institution_id  = NEW.institution_id
      AND division        = NEW.division
      AND id             != NEW.id;

    IF conflict_count > 0 THEN
      RAISE EXCEPTION 'INSTITUTION_DIVISION_CONFLICT: A team from this institution is already registered in this division.';
    END IF;

  ELSIF restriction = 'per_institution' THEN
    SELECT COUNT(*) INTO conflict_count
    FROM registrations
    WHERE event_id        = NEW.event_id
      AND institution_id  = NEW.institution_id
      AND id             != NEW.id;

    IF conflict_count > 0 THEN
      RAISE EXCEPTION 'INSTITUTION_CONFLICT: A team from this institution is already registered for this event.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_institution_restriction
  BEFORE INSERT ON registrations
  FOR EACH ROW EXECUTE FUNCTION check_institution_restriction();
```

---

### 4. Supabase Row Level Security (RLS) Strategy

| Table | RLS Policy Summary |
|---|---|
| `profiles` | `SELECT`: own row OR `auth.jwt() ->> 'role'` in ('admin', 'volunteer'). `UPDATE`: own row only (role updates restricted to service-role). |
| `events`, `categories`, `sub_categories` | `SELECT`: public (anon). `INSERT/UPDATE/DELETE`: `admin` only. |
| `event_division_instances`, `prize_pool_groups` | `SELECT`: public. `INSERT/UPDATE/DELETE`: `admin` only. |
| `registrations` | `SELECT`: `leader_id = auth.uid()` OR role in ('admin', 'volunteer'). `INSERT`: authenticated users (`leader_id = auth.uid()`). `UPDATE`: service-role only (Razorpay webhooks/admin verification). |
| `registration_members` | `SELECT`: `user_id = auth.uid()` OR role in ('admin', 'volunteer'). `INSERT`: leader via service-role / authenticated handler. |
| `ncc_groups`, `battalions`, `institutions` | `SELECT`: public. `INSERT/UPDATE/DELETE`: `admin` only. |
| `app_settings` | `SELECT`: public. `UPDATE`: `admin` only. |

*Note: Administrative endpoints and payment webhook callbacks utilize the Supabase **Service Role** client, bypassing RLS safely from trusted Next.js server route handlers.*

---

### 5. Authentication & User Profile Synchronization

- Next.js uses `@supabase/ssr` to manage cookies for auth tokens.
- When a user registers via Supabase Auth (Email or Google OAuth), a PostgreSQL trigger creates an initial entry in `profiles`:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```
- First event registration locks the `division` field (`division_locked = true`).

---

### 6. QR Token & Scanner Architecture

- Upon completion of first registration, a 128-bit random token is generated, signed into a compact **HS256 JWT** (with secret stored server-side), and saved in `profiles.qr_token`.
- The QR ticket encodes this JWT string (~180 chars).
- **Scanner Flow:**
  - Built-in scanner in `/volunteer/scan` (using `html5-qrcode`) decodes the token from the camera feed.
  - Client sends `GET /api/qr/resolve?token=<jwt>` with volunteer/admin session.
  - Server verifies JWT signature and queries Supabase (using service role or RLS volunteer policy) to aggregate:
    - User details (photo, division, institution, unit)
    - Direct registrations (`leader_id = userId`)
    - Team registrations where user is a team member (`registration_members.user_id = userId`)
    - Payment statuses for all events
  - Displays instant summary in modal/view.

---

### 7. Razorpay Integration Flow

```
Client (User)                 Next.js API Handler           Razorpay API
    |                                 |                          |
    |-- POST /api/register ---------> |                          |
    |   (form validation passed)      |-- createOrder() -------->|
    |                                 |<-- { order_id, amount } -|
    |                                 |   Insert pending reg     |
    |<-- { order_id, razorpay_key } --|                          |
    |                                                            |
    |-- Open Razorpay Modal --------> (User pays)                |
    |                                                            |
    |   [Option 1: Webhook]           |                          |
    |                                 |<-- webhook (captured) ---|
    |                                 |   Validate HMAC sig      |
    |                                 |   Update reg -> verified |
    |                                 |   Issue/ensure QR token  |
    |                                                            |
    |   [Option 2: Admin Fallback]    |                          |
    |   Admin clicks "Verify"         |-- fetchPayment(orderId)->|
    |                                 |<-- { status: captured } -|
    |                                 |   Update reg -> verified |
```

---

### 8. Frontend Routing & Access Matrix

```
/ (public)                    -- Home page, event cards, filters
/events/[id]                  -- Event detail page
/events/[id]/rules            -- Rules & regulations page
/auth/login                   -- Supabase email/password + Google login
/auth/register                -- Supabase sign-up
/dashboard                    -- Cadet dashboard + unified QR ticket
/dashboard/profile            -- Profile completion (division, institution cascade)
/register/[eventId]           -- Registration form (authenticated only)

/admin/*                      -- Admin panel (Role: admin)
  /admin/events                 -- Event CRUD + division thresholds
  /admin/categories             -- Category & sub-category CRUD
  /admin/institutions           -- Kerala NCC hierarchy manager
  /admin/registrations          -- Registrations view + payment verify button
  /admin/settings               -- Fest deadline config
  /admin/volunteers             -- Volunteer role management

/volunteer/scan               -- Dedicated QR scanner (Role: volunteer or admin)
```

---

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Supabase Auth vs App Profile desync | DB trigger `handle_new_user` guarantees row creation on sign-up; cascade delete on auth user cleanup |
| Race condition on institution limits | Database trigger `check_institution_restriction` blocks concurrent transactions immediately |
| In-browser scanner camera lag on low-end phones | Use lightweight `html5-qrcode` library with barcode fallback manual token input |
| Image storage bandwidth limits | Supabase Storage public bucket with client-side image compression prior to upload |
| Payment webhook delays | Webhook auto-verify supplemented with instantaneous client-side payment success handler and Admin manual verify button |

## Migration Plan

1. Create Supabase project and obtain `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `DATABASE_URL`.
2. Apply Prisma migrations to set up tables, triggers, and enums in Supabase PostgreSQL.
3. Configure Supabase Storage buckets: `event-posters` (public read) and `profile-photos` (public read).
4. Enable Google OAuth provider in Supabase Auth dashboard.
5. Seed Kerala NCC Group, Battalion, and Institution hierarchy.
6. Admin configures categories, events, and fest deadline.
7. Launch public site.
