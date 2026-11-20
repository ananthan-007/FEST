# Spec Delta

## Purpose

Captures each cadet's NCC identity details — division, institution, unit, and photo — used for eligibility filtering, institution-based team restriction enforcement, and display on the QR scan result.

## ADDED Requirements

### Requirement: User must complete their profile before registering for events
The system SHALL require a user to have a complete profile (division, institution selection, NCC unit, and display name) before they can register for any event. An incomplete profile SHALL result in a prompt to complete it when registration is attempted.

#### Scenario: Incomplete profile blocks registration
- **WHEN** a user with an incomplete profile attempts to register for an event
- **THEN** they are redirected to the profile completion screen with an explanatory message

#### Scenario: Complete profile allows registration
- **WHEN** a user with a complete profile attempts to register
- **THEN** registration proceeds normally

### Requirement: User selects their NCC division
The system SHALL allow each user to select exactly one division from: SD (Senior Division — Male, college/+1/+2), SW (Senior Wing — Female, college/+1/+2), JD (Junior Division — Male, school), JW (Junior Wing — Female, school). Division is self-declared and cannot be changed after the first event registration.

#### Scenario: Division saved on profile
- **WHEN** a user selects a division and saves their profile
- **THEN** the division is stored and used for eligibility checks

#### Scenario: Division locked after first registration
- **WHEN** a user who has at least one registration attempts to change their division
- **THEN** the change is rejected with a message that division is locked after registration

### Requirement: User selects their institution via the NCC hierarchy
The system SHALL present institution selection as a three-step cascade: Group (5 Kerala NCC Groups) → Battalion (filtered by selected group) → Institution (filtered by selected battalion). The selected institution is stored on the user profile and used for team institution-restriction enforcement.

#### Scenario: Institution selected via cascade
- **WHEN** a user selects a Group, then a Battalion, then an Institution
- **THEN** the institution is saved to their profile

#### Scenario: Institution selection resets on group change
- **WHEN** a user changes their selected Group
- **THEN** the Battalion and Institution fields reset

### Requirement: User uploads a profile photo
The system SHALL allow a user to upload a profile photo. The photo SHALL be displayed on the QR scan result screen. Photo upload is optional but recommended.

#### Scenario: Photo uploaded and displayed
- **WHEN** a user uploads a valid image (JPEG or PNG, max 2MB)
- **THEN** the photo is stored and shown on the QR scan result for that user

#### Scenario: Oversized photo rejected
- **WHEN** a user uploads an image larger than 2MB
- **THEN** the upload is rejected with a size-limit error

### Requirement: User provides their NCC unit
The system SHALL allow a user to enter their NCC unit name as free text (e.g., "1 Delhi Battalion NCC"). This is stored on the profile and displayed on the QR scan result.

#### Scenario: Unit saved
- **WHEN** a user enters their NCC unit and saves the profile
- **THEN** the unit is stored and displayed on the QR scan result
