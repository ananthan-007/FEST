# Proposal

## Why

NCC fests in Kerala currently manage event registrations through manual processes (paper forms, spreadsheets, WhatsApp coordination), making it error-prone, time-consuming, and difficult to enforce eligibility and institution-based team restrictions. A dedicated digital platform is needed to handle the full registration lifecycle — from event discovery to payment to on-the-day QR-based participant verification — before the upcoming fest.

## What Changes

- **New platform (greenfield)**: No existing codebase; this is a full build.
- Cadets can browse events filtered by category and register individually or as a team, paying per event via Razorpay.
- A unified QR ticket is generated per registered cadet; volunteers scan it at the venue using a built-in panel scanner to view all their registered events.
- Admins manage the full event hierarchy (categories → sub-categories → events), configure eligibility, team sizes, institution restrictions, prize pools, and conflict alerts.
- Volunteers have a scoped panel (QR scanner only); they cannot create or modify events.
- Division-based eligibility (SD, SW, JD, JW) is enforced at registration; each eligible division runs as a separate competition instance with its own prize pool and minimum-team threshold.
- Institution restrictions ("one team per institution per division") are enforced at registration for applicable team events using a Kerala NCC institution hierarchy (5 Groups → Battalions → Institutions).
- Payment verification uses Razorpay webhooks (auto) and an admin-triggered manual verify (fallback).
- Two-stage conflict alerts warn cadets when registering for events with overlapping schedules.

## Capabilities

### New Capabilities

- `auth`: User registration and login via email/password and Google OAuth; role assignment (Admin, Volunteer, User).
- `user-profile`: Cadet profile capturing division (SD/SW/JD/JW, self-declared), NCC institution hierarchy selection (Group → Battalion → Institution), NCC unit, and profile photo.
- `institution-hierarchy`: Admin-managed master list of Kerala NCC Groups, Battalions, and Institutions used for team restriction enforcement and participant tracking.
- `event-management`: Admin CRUD for two-level category hierarchy and events, including eligibility divisions, team size config, institution restriction mode, conflict-alert linking, schedule, fee, poster, rules page, and prize pool groups.
- `division-instances`: Per-eligible-division competition instances within an event, each with its own minimum-team threshold, status (active/below-threshold), and prize pool amounts.
- `event-discovery`: Public browse-first home page with nested category filters and division-aware event cards; event detail page with separate rules page.
- `registration`: Individual and team registration flows; team-member email validation against user DB; institution restriction enforcement; two-stage conflict-alert display; per-event Razorpay payment.
- `payment`: Razorpay order creation per registration, webhook-based auto-verification, and admin-triggered manual payment verification via Razorpay Fetch Payment API.
- `qr-ticket`: Unique signed-token QR generated per user after first registration; displays all registered events (including team events where the user is a member); built-in scanner in Admin and Volunteer panels.
- `admin-panel`: Full admin interface covering event management, institution master list, registration views grouped by event and division, payment verification, and volunteer role management.
- `volunteer-panel`: Scoped interface for volunteers: QR scanner and participant detail view only.

### Modified Capabilities

_(None — this is a greenfield project.)_

## Impact

- **New dependencies**: Razorpay SDK (payment), Google OAuth library, QR code generation library, image upload/storage (event posters, profile photos).
- **External services**: Razorpay (payment gateway + webhook endpoint), Google OAuth.
- **APIs introduced**: REST (or tRPC) API covering auth, user profile, event CRUD, registration, payment, QR lookup, and admin/volunteer actions.
- **Database**: Relational schema covering users, roles, institution hierarchy, categories, sub-categories, events, division instances, registrations, team members, payments, and QR tokens.
- **No existing code affected** — greenfield build.
