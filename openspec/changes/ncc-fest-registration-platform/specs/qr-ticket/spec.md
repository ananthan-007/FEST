# Spec Delta

## Purpose

Provides each registered cadet with a unique QR code that serves as their unified fest pass, and equips Admin and Volunteer panels with a built-in scanner that instantly displays all events a scanned cadet is registered for.

## ADDED Requirements

### Requirement: A unique QR ticket is generated per user after their first registration
The system SHALL generate a QR code for a user the first time they complete a registration (any event, any status). The QR SHALL encode a short, cryptographically signed token unique to the user. Subsequent registrations update the data shown on scan without changing the QR code or token.

#### Scenario: QR generated after first registration
- **WHEN** a user submits their first registration (payment pending or verified)
- **THEN** a QR code is generated for that user and shown on their dashboard

#### Scenario: QR unchanged after additional registrations
- **WHEN** a user registers for a second event
- **THEN** the same QR code remains; the scan result is updated to include the new event

### Requirement: The user can view their QR ticket from their dashboard
The system SHALL display the user's QR code on their dashboard, alongside a list of all their registered events and payment statuses. The QR SHALL be visually scannable on screen (no download required, though download as image shall also be supported).

#### Scenario: QR displayed on dashboard
- **WHEN** a user visits their dashboard after at least one registration
- **THEN** their QR code and registration summary are shown

#### Scenario: User with no registrations sees no QR
- **WHEN** a user visits their dashboard with zero registrations
- **THEN** no QR is shown; a message prompts them to register for an event

### Requirement: Team members see team events on their QR scan result
The system SHALL include team events on the scan result of each team member, not only the leader. For each team event, the scan result SHALL show the user's role (Leader or Member) and the team name.

#### Scenario: Member's QR shows team event
- **WHEN** a volunteer scans a team member's QR code
- **THEN** the team event appears on the scan result with role "Member" and the team leader's name

#### Scenario: Leader's QR shows team event with role "Leader"
- **WHEN** a volunteer scans the team leader's QR code
- **THEN** the team event appears on the scan result with role "Leader"

### Requirement: Admin and Volunteer panels include a built-in QR scanner
The system SHALL provide a built-in camera-based QR scanner within the Admin and Volunteer panels. On a successful scan, the system SHALL resolve the token to the user record and display the participant detail view without any additional navigation.

#### Scenario: Successful scan shows participant details
- **WHEN** a volunteer scans a valid QR code using the built-in scanner
- **THEN** the participant detail view is displayed showing: photo, name, division, NCC unit, institution, and all registered events with payment status

#### Scenario: Invalid or expired token shows error
- **WHEN** the scanner reads a QR code with an invalid or unrecognised token
- **THEN** an error state is shown: "QR code not recognised"

#### Scenario: Scanner requires authentication
- **WHEN** an unauthenticated user accesses the scanner URL directly
- **THEN** they are redirected to login

### Requirement: Scan result shows payment status per event
The system SHALL display each registration's payment status ("Payment Verified" or "Pending Payment") on the QR scan result. Events with pending payment SHALL be visually distinguished from verified ones (e.g., different colour or badge).

#### Scenario: Verified payment shown as confirmed
- **WHEN** an event registration has status "Payment Verified"
- **THEN** the scan result shows a green "Verified" indicator for that event

#### Scenario: Pending payment shown distinctly
- **WHEN** an event registration has status "Pending Payment"
- **THEN** the scan result shows an amber "Pending" indicator for that event
