# Spec Delta

## Purpose

Provides Admins with a comprehensive management interface covering event and category CRUD, institution hierarchy management, registration monitoring grouped by event and division, payment verification, volunteer role management, and fest-wide settings.

## ADDED Requirements

### Requirement: Admin panel is accessible only to Admin-role users
The system SHALL restrict all admin panel routes to users with the Admin role. Any access attempt by a Volunteer or regular User SHALL redirect to an unauthorised page.

#### Scenario: Admin accesses admin panel
- **WHEN** an Admin navigates to the admin panel
- **THEN** the full admin interface is rendered

#### Scenario: Non-admin access redirected
- **WHEN** a Volunteer or User navigates to an admin panel URL
- **THEN** they are redirected to an unauthorised page

### Requirement: Admin views registrations grouped by event and division
The system SHALL provide a registrations view in the admin panel listing all registrations, filterable by event and division instance. Each row SHALL show: registrant name, division, institution, team name (for teams), payment status, and registration timestamp.

#### Scenario: Admin filters registrations by event
- **WHEN** an Admin selects an event in the registrations filter
- **THEN** only registrations for that event are shown

#### Scenario: Admin filters by division instance
- **WHEN** an Admin selects a specific division (e.g., SD) within an event
- **THEN** only SD registrations for that event are shown

### Requirement: Admin can verify payment manually from registrations view
The system SHALL provide a "Verify Payment" action on each registration row with "Pending Payment" status. This triggers the Razorpay Fetch Payment API call and updates the status as described in the payment spec.

#### Scenario: Verify Payment action present on pending rows
- **WHEN** an Admin views a registration with "Pending Payment" status
- **THEN** a "Verify Payment" button is shown for that row

### Requirement: Admin manages the fest-wide registration deadline
The system SHALL provide a settings page where Admin can set and update the global registration deadline (date and time). The deadline is enforced across all events as specified in the payment spec.

#### Scenario: Admin sets deadline
- **WHEN** an Admin sets a registration deadline date and time and saves
- **THEN** new registrations after that datetime are blocked platform-wide

### Requirement: Admin can assign and revoke the Volunteer role
The system SHALL allow Admin to search for a user by email or name, view their current role, and assign or revoke the Volunteer role.

#### Scenario: Admin assigns volunteer
- **WHEN** an Admin searches for a user and assigns the Volunteer role
- **THEN** the user's role is updated and they can access the volunteer panel

#### Scenario: Admin revokes volunteer role
- **WHEN** an Admin revokes the Volunteer role from a user
- **THEN** the user is downgraded to the User role and loses volunteer panel access
