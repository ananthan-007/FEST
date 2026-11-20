# Spec Delta

## Purpose

Provides a minimal, focused interface for Volunteers that exposes only the built-in QR scanner and participant detail view, with no access to event management or payment controls.

## ADDED Requirements

### Requirement: Volunteer panel is accessible to Volunteer and Admin roles only
The system SHALL restrict volunteer panel routes to users with Volunteer or Admin role. Regular Users SHALL be redirected to an unauthorised page.

#### Scenario: Volunteer accesses volunteer panel
- **WHEN** a Volunteer navigates to the volunteer panel
- **THEN** the QR scanner interface is shown

#### Scenario: Regular user blocked
- **WHEN** a regular User navigates to the volunteer panel URL
- **THEN** they are redirected to an unauthorised page

### Requirement: Volunteer panel contains only the QR scanner and scan result view
The system SHALL render the volunteer panel as a single-purpose screen: a large camera viewfinder for QR scanning and, after a successful scan, the participant detail view. No navigation to event management, registrations list, or payment tools SHALL be accessible from this panel.

#### Scenario: Volunteer sees only scanner
- **WHEN** a Volunteer opens the volunteer panel
- **THEN** only the QR scanner viewfinder is shown; no event management links are present

#### Scenario: Scan result displayed after valid scan
- **WHEN** a Volunteer scans a valid participant QR code
- **THEN** the participant detail view replaces the scanner view, showing: photo, name, division, institution, NCC unit, and all registered events with payment status

#### Scenario: Scanner resets after scan result viewed
- **WHEN** a Volunteer clicks "Scan Another" on the participant detail view
- **THEN** the scanner viewfinder is shown again ready for the next scan
