# Spec Delta

## Purpose

Governs the full registration flow for individual and team events, including eligibility enforcement, team-member email validation, institution restriction checks, and handoff to payment.

## ADDED Requirements

### Requirement: Eligible users can register individually for individual events
The system SHALL allow an authenticated user with a complete profile to register for an individual event, provided their division is in the event's eligible divisions list and they have not already registered for the same event.

#### Scenario: Eligible individual registration accepted
- **WHEN** an SD user registers for an individual event that lists SD as eligible
- **THEN** a registration record is created and the user is directed to payment

#### Scenario: Ineligible division blocked
- **WHEN** a JD user attempts to register for an event that lists only SD and SW as eligible
- **THEN** registration is rejected with a message indicating their division is not eligible

#### Scenario: Duplicate individual registration blocked
- **WHEN** a user who is already registered for an event attempts to register again
- **THEN** registration is rejected with a message that they are already registered

### Requirement: Team leader can register a team for a team event
The system SHALL allow an authenticated user with a complete profile to create a team registration by providing a team name and the email addresses of team members. The leader's own account is automatically included as a member. All member emails SHALL be validated against existing user accounts in the database; unrecognised emails SHALL block submission.

#### Scenario: Valid team registration submitted
- **WHEN** a leader provides a team name and valid member emails within the allowed size range
- **THEN** a team registration record is created linking all member user IDs, and the leader is directed to payment

#### Scenario: Unknown member email blocks submission
- **WHEN** a leader enters an email that does not match any registered user account
- **THEN** an inline error is shown on that email field: "No account found for this email. This person must register on the platform first."

#### Scenario: Team size out of range blocks submission
- **WHEN** a leader submits a team with fewer members than the event minimum or more than the event maximum
- **THEN** submission is blocked with the allowed range stated

#### Scenario: Team member already in another team for same event
- **WHEN** a team leader adds a member email whose user is already in a registered team for the same event
- **THEN** submission is blocked with a message that the user is already registered for that event

### Requirement: Institution restriction is enforced at registration
Before confirming a team registration, the system SHALL check the event's institution restriction mode against the leader's institution and division. If a conflict is found, the registration SHALL be rejected with a specific message.

#### Scenario: Per-division institution conflict blocked
- **WHEN** a team leader from Institution X submits a team for an event set to "one per institution per division" and a team from Institution X in the same division already exists
- **THEN** registration is rejected: "Your institution already has a team registered for this event in your division"

#### Scenario: Absolute institution conflict blocked (Guard of Honour style)
- **WHEN** a team leader from Institution X submits a team for an event set to "one per institution" and any team from Institution X already exists
- **THEN** registration is rejected: "Your institution already has a team registered for this event"

### Requirement: Each registration is paid separately via Razorpay
After a registration form is submitted and passes all validation, the system SHALL create a Razorpay order for the event's registration fee and present the Razorpay payment popup. The registration is held in "Pending Payment" status until payment is confirmed.

#### Scenario: Payment popup presented after valid registration
- **WHEN** all registration validations pass
- **THEN** a Razorpay order is created and the payment popup is shown

#### Scenario: Successful payment confirms registration
- **WHEN** Razorpay confirms payment (via webhook or callback)
- **THEN** the registration status is updated to "Payment Verified" and the user's QR ticket is updated to include the new event

#### Scenario: Abandoned payment leaves registration pending
- **WHEN** a user dismisses the payment popup without completing payment
- **THEN** the registration remains in "Pending Payment" status and the user can retry payment from their dashboard
