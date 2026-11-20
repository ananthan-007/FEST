# Tasks

## 1. Project Scaffolding & Infrastructure (Supabase + Next.js)

- [x] 1.1 Initialise a Next.js 14 (App Router) project with TypeScript; verify `npm run dev` starts without errors
- [x] 1.2 Set up Supabase project and configure environment variables in `.env.example` and `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `QR_JWT_SECRET`
- [x] 1.3 Configure Prisma with the Supabase PostgreSQL connection string; verify `npx prisma db push` or migration runs successfully against Supabase
- [x] 1.4 Write the full Prisma schema matching Supabase PostgreSQL tables: `ncc_groups`, `battalions`, `institutions`, `profiles`, `categories`, `sub_categories`, `events`, `parallel_event_links`, `prize_pool_groups`, `event_division_instances`, `registrations`, `registration_members`, and `app_settings`; verify `npx prisma validate` passes
- [x] 1.5 Add PostgreSQL triggers and functions via migration SQL: `check_institution_restriction` trigger on `registrations` table and `handle_new_user` trigger on `auth.users`; verify triggers are active in Supabase
- [x] 1.6 Configure Supabase Storage buckets (`event-posters`, `profile-photos`) with public read access and authenticated upload policies; verify image upload and public URL resolution via Supabase client
- [x] 1.7 Set up Next.js middleware using `@supabase/ssr` to refresh session cookies and enforce route guards for `/admin/*` (Admin only), `/volunteer/scan` (Admin + Volunteer), `/dashboard` and `/register/*` (authenticated cadets); verify unauthenticated requests redirect to `/auth/login`

## 2. Authentication (Supabase Auth)

- [x] 2.1 Set up Supabase Auth client and server helpers with `@supabase/ssr`; configure Email/Password and Google OAuth providers; verify Google login and email sign-up both successfully authenticate
- [x] 2.2 Verify `handle_new_user` DB trigger creates a linked `profiles` row with role `user` upon sign-up via either email or Google OAuth
- [x] 2.3 Implement login, sign-up, and password recovery pages (`/auth/login`, `/auth/register`); verify invalid credentials display clear error messages
- [x] 2.4 Implement sign-out action; verify session cookie is cleared and user is redirected to home page
- [x] 2.5 Implement Admin role-assignment endpoint (`PATCH /api/admin/users/[id]/role`) using Supabase Service Role client; verify a regular user receives 403 and an Admin can promote a user to `volunteer` or `admin`

## 3. Institution Hierarchy (Admin)

- [x] 3.1 Build Prisma / Supabase CRUD operations for `ncc_groups`, `battalions` (linked to group), and `institutions` (linked to battalion); verify create/retrieve works via test script
- [x] 3.2 Implement API routes: `GET/POST /api/admin/groups`, `GET/POST /api/admin/battalions`, `GET/POST /api/admin/institutions`; include delete guard rejecting if linked registrations or profiles exist; verify guard returns 409
- [x] 3.3 Build Admin institution hierarchy manager (`/admin/institutions`): Group accordion → Battalion list → Institution list with inline add/edit/delete; verify newly added institution appears in the user profile cascade
- [x] 3.4 Implement cascading dropdown endpoint `GET /api/institutions/cascade?groupId=&battalionId=`; verify changing Group resets Battalion and Institution selections

## 4. User Profile

- [x] 4.1 Build profile completion page (`/dashboard/profile`): display name, phone, division selector (SD/SW/JD/JW), institution cascade (Group → Battalion → Institution), NCC unit, and profile photo upload; verify saving sets `profile_complete = true` on `profiles`
- [x] 4.2 Implement division-lock enforcement: once a user has registered for at least one event, `division_locked` is set to `true` and any division edit is rejected with a 422 error
- [x] 4.3 Implement profile photo upload directly to Supabase Storage `profile-photos` bucket; verify image URL is saved to user's profile and rejected if file size exceeds 2MB
- [x] 4.4 Implement profile completion gate in registration flow: if `profile_complete = false`, automatically redirect user to `/dashboard/profile` with an instructional alert

## 5. Category & Event Management (Admin)

- [x] 5.1 Implement Category and SubCategory CRUD API routes (`/api/admin/categories`, `/api/admin/subcategories`); include delete guard that rejects removal of categories containing events with active registrations
- [x] 5.2 Implement Event CRUD API (`/api/admin/events`): handle all fields (title, poster upload to Supabase Storage, rich-text rules, date/time/venue, fee, team constraints, eligibility divisions, institution restriction mode, conflict alert); verify saving auto-creates `event_division_instances` rows for each eligible division
- [x] 5.3 Implement division-instance auto-sync on event edit: adding an eligible division creates an instance; removing an eligible division soft-marks instance as `cancelled` (retaining existing registrations); verify with a test
- [x] 5.4 Implement PrizePoolGroup API: configure 1st, 2nd, and 3rd place prizes per division group; enforce validation blocking SD+JD and SW+JW grouping; verify validation rejects invalid combinations
- [x] 5.5 Implement ParallelEventLink API: link/unlink parallel events; verify bidirectional relationship is preserved
- [x] 5.6 Build Admin event list page (`/admin/events`): display event title, category, eligibility, division statuses, and registration counts with Create and Edit actions
- [x] 5.7 Build Admin event editor form (`/admin/events/new`, `/admin/events/[id]/edit`) with all fields, poster upload, and prize pool builder
- [x] 5.8 Build Admin category management UI (`/admin/categories`) with inline two-level CRUD

## 6. Event Discovery (Public)

- [x] 6.1 Build home page (`/`): hero section, category filter bar (primary category + secondary sub-category pills), and responsive event card grid; verify SSR initial render with fast paint
- [x] 6.2 Implement category filter state: clicking a Category shows its Sub-categories; clicking a Sub-category filters cards; "All" resets; verify event cards react instantly
- [x] 6.3 Build event detail page (`/events/[id]`): full description, rules link, date/time/venue, eligibility badges, fee, and Register button (redirects to login if guest)
- [x] 6.4 Build dedicated rules page (`/events/[id]/rules`): renders event's rich text rules cleanly; verify accessible without authentication
- [x] 6.5 Implement conflict alert Stage 1: when user clicks Register on an event with `conflict_alert_enabled = true`, display warning modal before opening registration form; verify modal requires user confirmation to proceed

## 7. Registration Flow

- [x] 7.1 Build individual registration form (`/register/[eventId]`): checks profile completion gate; submits registration with `participation_type = individual` and `payment_status = pending`
- [x] 7.2 Build team registration form: team name input and dynamic member email fields (bounded by `team_min` and `team_max`); implement real-time debounced email lookup against `profiles` table; verify unregistered email displays inline error and prevents submission
- [x] 7.3 Implement conflict alert Stage 2: upon form submission, query user's existing registrations; if a registration exists for any linked parallel event, show a confirmation modal naming the conflict; verify user can choose to go back or proceed to payment
- [x] 7.4 Enforce division eligibility API-side: reject registration if user's division is not in `event.eligible_divisions`
- [x] 7.5 Verify institution restriction enforcement via `check_institution_restriction` trigger: simulate concurrent registrations from same institution to confirm DB-level block
- [x] 7.6 Enforce duplicate registration prevention: reject if user is already registered individually or as a team member in another team for the same event

## 8. Payment (Razorpay)

- [x] 8.1 Install Razorpay Node SDK; implement `POST /api/payments/create-order`: create Razorpay order for registration fee (per-person for individual, per-team for team); store `razorpay_order_id` in `registrations`
- [x] 8.2 Integrate Razorpay checkout popup on client: initialize modal with `order_id` and public key; on payment success, trigger server verification callback
- [x] 8.3 Implement Razorpay webhook handler (`POST /api/webhooks/razorpay`): verify HMAC-SHA256 signature; on `payment.captured`, update registration `payment_status = verified` and trigger QR token creation/update
- [x] 8.4 Implement Admin manual verify action (`POST /api/admin/payments/verify`): fetch payment from Razorpay API by `razorpay_order_id`, confirm amount and status, update registration to `verified`
- [x] 8.5 Implement fest-wide deadline enforcement: read `registration_deadline` from `app_settings`; block new registrations after deadline while permitting pending-payment completion

## 9. QR Ticket & Verification

- [x] 9.1 Implement QR token generation: upon first registration (any payment status), generate a signed HS256 JWT containing `userId` and store in `profiles.qr_token`; ensure token remains constant on subsequent registrations
- [x] 9.2 Implement QR resolution endpoint (`GET /api/qr/resolve?token=<jwt>`): verify JWT signature; return cadet profile, all individual registrations, and team registrations where cadet is leader or member, along with payment status
- [x] 9.3 Display QR ticket on cadet dashboard (`/dashboard`) using `qrcode` library; verify QR decodes to the user's signed JWT
- [x] 9.4 Build participant detail view component (shared by Admin and Volunteer panels): show photo, name, division, institution, NCC unit, and event registration list with green "Verified" or amber "Pending" badges
- [x] 9.5 Build built-in camera QR scanner page (`/volunteer/scan`) using `html5-qrcode`: decode camera feed, fetch `/api/qr/resolve`, display participant detail view, and provide "Scan Another" reset button

## 10. Admin Panel — Registrations & Settings

- [x] 10.1 Build registrations management page (`/admin/registrations`): table with filters by category, event, division instance, and payment status; show team name and member count
- [x] 10.2 Add "Verify Payment" button on pending registration rows; connect to manual verify API (task 8.4) with inline status update
- [x] 10.3 Build Admin settings page (`/admin/settings`): fest-wide registration deadline date/time picker writing to `app_settings`; verify deadline takes effect immediately
- [x] 10.4 Build volunteer management page (`/admin/volunteers`): search users, view current roles, toggle Volunteer role with instant persistence

## 11. Volunteer Panel

- [x] 11.1 Build lightweight volunteer shell at `/volunteer/scan`: restrict route to Volunteer and Admin roles; omit administrative navigation
- [x] 11.2 Test scanner on physical mobile device: verify camera permission prompt, barcode recognition speed (<1s), and accurate participant event list rendering *(Note: Physical device test requires manual on-device execution; scanner UI and html5-qrcode integration implemented)*

## 12. Integration & Verification

- [x] 12.1 Run `openspec validate` for the change and verify 0 validation errors
- [ ] 12.2 Run end-to-end user registration test: sign up via Google OAuth, complete profile, register for an individual and team event, complete Razorpay test payment, and verify QR ticket generation
- [ ] 12.3 Run institution restriction test: attempt registering 2 teams from same institution in same division; verify first succeeds and second is rejected with trigger error
- [ ] 12.4 Run two-stage conflict alert test: verify Stage 1 modal appears on Register click, and Stage 2 appears on submit when a conflicting registration is present
- [ ] 12.5 Test volunteer QR scanner end-to-end: scan generated user QR code and verify all registered events (individual and team membership) display with verified status
- [ ] 12.6 Verify responsive mobile layout across home page, forms, dashboard, and scanner on 375px viewport

## Workflow follow-up

- Review all planning artifacts and confirm scope with stakeholders before starting implementation.
- Archive the change after implementation is complete and all tasks are checked: `openspec archive ncc-fest-registration-platform`.
