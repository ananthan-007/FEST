# Spec Delta

## Purpose

Models the per-division competition instances within each event, each with its own minimum-team threshold and status, so that an event can run for some divisions but be cancelled for others that fall below the required participation count.

## ADDED Requirements

### Requirement: Each eligible division generates a separate competition instance
The system SHALL automatically create one division instance per eligible division when an event is saved (e.g., an event eligible for SD and SW produces an SD instance and an SW instance). Each instance tracks its own registration count, minimum-team threshold, and active/below-threshold status.

#### Scenario: Division instances created on event save
- **WHEN** an Admin saves an event with SD and SW eligibility
- **THEN** two division instances are created: one for SD and one for SW

#### Scenario: Adding a division adds a new instance
- **WHEN** an Admin edits an event to add JD eligibility
- **THEN** a JD division instance is created for that event

### Requirement: Admin sets minimum-team threshold per division instance
For team events, the system SHALL allow Admin to set a minimum number of teams required for each division instance to be considered active. The admin panel SHALL display the current registration count and threshold for each instance.

#### Scenario: Threshold set and status reflected
- **WHEN** an Admin sets a minimum threshold of 3 for the SW division instance of an event and only 1 SW team is registered
- **THEN** the SW instance is marked "Below Threshold" in the admin panel

#### Scenario: Threshold met activates instance
- **WHEN** registrations for a division instance reach or exceed its minimum threshold
- **THEN** the instance status updates to "Active"

### Requirement: Admin can mark a division instance as cancelled
The system SHALL allow Admin to manually mark a division instance as "Cancelled" with a reason. Cancelled instances are hidden from the public event page but their registrations are retained.

#### Scenario: Cancelled instance hidden from public
- **WHEN** an Admin cancels a division instance
- **THEN** that division is no longer shown in the public event's eligibility list, but all registrations remain in the database

#### Scenario: Admin views all instances including cancelled
- **WHEN** an Admin views the event in the admin panel
- **THEN** all division instances including cancelled ones are listed with their status and registration counts
