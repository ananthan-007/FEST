# Spec Delta

## Purpose

Maintains the admin-managed master list of Kerala NCC Groups, Battalions, and Institutions, used for participant institution selection during profile setup and for enforcing per-institution team registration limits.

## ADDED Requirements

### Requirement: Admin manages the institution hierarchy
The system SHALL allow Admins to create, edit, and delete Groups, Battalions (linked to a Group), and Institutions (linked to a Battalion). Deleting a Group SHALL cascade-delete its Battalions and Institutions only if none have associated user profiles. Otherwise the delete SHALL be rejected with a dependency error.

#### Scenario: Admin creates a Group
- **WHEN** an Admin creates a new Group with a unique name
- **THEN** the Group appears in the institution selection cascade for all users

#### Scenario: Admin creates a Battalion under a Group
- **WHEN** an Admin creates a Battalion linked to an existing Group
- **THEN** the Battalion appears in the cascade when that Group is selected

#### Scenario: Admin creates an Institution under a Battalion
- **WHEN** an Admin creates an Institution linked to an existing Battalion
- **THEN** the Institution appears in the cascade when that Battalion is selected

#### Scenario: Deleting a Group with linked users is rejected
- **WHEN** an Admin attempts to delete a Group whose Institutions have user profiles linked to them
- **THEN** the delete is rejected with a message listing the dependency

### Requirement: Institution hierarchy is used to enforce one-team-per-institution limits
The system SHALL check a team leader's institution against existing registrations for the same event and division when the event's institution restriction is set to "one team per institution per division". If a team from the same institution and same division is already registered, the new registration SHALL be rejected.

#### Scenario: First team from institution is accepted
- **WHEN** a team leader from Institution X registers a team for an event with per-division institution restriction and no other team from Institution X in that division exists
- **THEN** registration proceeds

#### Scenario: Second team from same institution and division is rejected
- **WHEN** a team leader from Institution X attempts to register a second team for the same event and division where Institution X already has a team
- **THEN** the registration is rejected with a message: "Your institution already has a team registered for this event in your division"

#### Scenario: Guard of Honour single-team-per-institution check
- **WHEN** a team leader attempts to register a Guard of Honour team and their institution already has a team registered for Guard of Honour (regardless of division)
- **THEN** the registration is rejected with an institution conflict message
