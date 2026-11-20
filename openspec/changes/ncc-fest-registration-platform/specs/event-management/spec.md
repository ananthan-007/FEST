# Spec Delta

## Purpose

Enables Admins to build and maintain the full event hierarchy — two-level categories, events with eligibility and team configuration, prize pool groups, conflict-alert links, rules pages, and schedule — that drives the entire registration platform.

## ADDED Requirements

### Requirement: Admin manages two-level category hierarchy
The system SHALL allow Admins to create, edit, and delete top-level Categories and Sub-categories nested within them. Each event SHALL belong to exactly one Sub-category.

#### Scenario: Admin creates a category
- **WHEN** an Admin creates a new Category with a unique name
- **THEN** it appears in the category filter on the public home page

#### Scenario: Admin creates a sub-category
- **WHEN** an Admin creates a Sub-category linked to an existing Category
- **THEN** it is available as an event container and appears as a secondary filter

#### Scenario: Deleting a category with active events is rejected
- **WHEN** an Admin attempts to delete a Category or Sub-category that contains events with active registrations
- **THEN** the delete is rejected with a message listing the dependent events

### Requirement: Admin creates and edits events with full configuration
The system SHALL provide an event creation/edit form with the following fields: title, poster image, description, eligibility divisions (multi-select: SD, SW, JD, JW), participation type (Individual or Team), date, time, venue, registration fee (per person for individual events; per team for team events), rules and regulations content (rich text, rendered as a separate page), and sub-category assignment.

#### Scenario: Admin creates an event
- **WHEN** an Admin fills all required fields and saves
- **THEN** the event is created, appears in the admin event list, and is visible on the public home page

#### Scenario: Admin edits an event
- **WHEN** an Admin edits an existing event's fields and saves
- **THEN** the updated details are reflected immediately on the public site

#### Scenario: Admin deletes an event with no registrations
- **WHEN** an Admin deletes an event that has zero registrations
- **THEN** the event is removed from all views

#### Scenario: Admin deletes an event with registrations is confirmed
- **WHEN** an Admin attempts to delete an event that has existing registrations
- **THEN** a confirmation prompt is shown warning about existing registrations before proceeding

### Requirement: Admin configures team size for team events
For events with participation type Team, the system SHALL allow Admin to set minimum and maximum member counts. Admin SHALL be able to toggle "Fixed size" to lock minimum equal to maximum.

#### Scenario: Fixed-size team enforced at registration
- **WHEN** a team leader submits a team with fewer or more members than the fixed size
- **THEN** registration is rejected with the required size stated

#### Scenario: Min/max range enforced at registration
- **WHEN** a team leader submits a team with member count outside the configured min–max range
- **THEN** registration is rejected with the allowed range stated

### Requirement: Admin configures institution restriction per event
For team events, the system SHALL allow Admin to set the institution restriction mode to one of: None (no restriction), One team per institution (absolute), or One team per institution per division.

#### Scenario: Restriction mode saved and applied
- **WHEN** an Admin sets an institution restriction mode on an event and saves
- **THEN** that mode is enforced at registration time for that event

### Requirement: Admin configures conflict alerts for parallel events
The system SHALL allow Admin to enable a conflict alert on an event and link it to one or more other events that run at the same time. When enabled, Stage 1 of the two-stage conflict alert fires for any user who clicks Register on that event.

#### Scenario: Admin links parallel events
- **WHEN** an Admin enables the conflict alert on Event B and links Event A as parallel
- **THEN** Stage 1 alert fires for all users when they click Register on Event B, and Stage 2 fires if the user is already registered for Event A

### Requirement: Each event has a rules and regulations page
The system SHALL store rules and regulations content (rich text) per event and render it as a dedicated public page accessible from the event card and event detail page.

#### Scenario: Rules page is accessible
- **WHEN** a user clicks "Rules & Regulations" on an event card or detail page
- **THEN** a dedicated page is displayed with the full rules content for that event

### Requirement: Admin configures prize pool groups per event
The system SHALL allow Admin to define one or more prize pool groups for each event. Each group has a name, a set of eligible divisions (constrained: SD+JD and SW+JW combinations are invalid), and prize amounts for 1st, 2nd, and optionally 3rd place.

#### Scenario: Valid prize pool group saved
- **WHEN** an Admin defines a prize pool group with a valid division combination and prize amounts
- **THEN** the group is saved to the event

#### Scenario: Invalid division combination rejected
- **WHEN** an Admin selects SD and JD together (or SW and JW together) in a prize pool group
- **THEN** the form shows an inline error: "Cannot group same-gender divisions across Senior and Junior"
