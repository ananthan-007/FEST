# Spec Delta

## Purpose

Provides the public-facing browse-first home page and event detail pages, allowing cadets to discover events by category, view eligibility and details, and navigate to registration or rules pages.

## ADDED Requirements

### Requirement: Home page displays event cards in a browse-first layout
The system SHALL present a home page with a hero section, a category filter bar, and a grid of event cards. Each card SHALL show: event poster, title, category breadcrumb (Category > Sub-category), participation type (Individual/Team), eligible divisions, registration fee, and buttons for Details and Register.

#### Scenario: Home page loads with all events
- **WHEN** a visitor opens the home page
- **THEN** all active events are displayed as cards in a grid layout

#### Scenario: Logged-in user sees Register button
- **WHEN** an authenticated user views the home page
- **THEN** each event card shows a "Register" button

#### Scenario: Guest user sees Login to Register prompt
- **WHEN** an unauthenticated user clicks "Register" on an event card
- **THEN** they are redirected to the login page with a return URL to the event

### Requirement: Category filter bar filters the event grid
The system SHALL display a primary filter bar of top-level Categories. Selecting a Category reveals a secondary row of its Sub-categories. Selecting a Sub-category filters the event grid to show only events in that Sub-category. Selecting "All" resets both filters.

#### Scenario: Primary category filter applied
- **WHEN** a user clicks a Category in the filter bar
- **THEN** only events belonging to that Category (across all its Sub-categories) are shown

#### Scenario: Sub-category filter applied
- **WHEN** a user selects a Sub-category
- **THEN** only events in that Sub-category are shown

#### Scenario: Filter reset
- **WHEN** a user clicks "All"
- **THEN** all active events are displayed

### Requirement: Event detail page shows full event information
The system SHALL provide a dedicated event detail page showing: poster, title, full description, eligible divisions, participation type, team size (for team events), date, time, venue, registration fee, a link to the Rules & Regulations page, and a Register button.

#### Scenario: Event detail page loads
- **WHEN** a user clicks "Details" on an event card
- **THEN** the event detail page renders with all event fields

### Requirement: Rules and regulations page is publicly accessible
The system SHALL render a dedicated rules page for each event at a stable URL, displaying the admin-entered rules content. This page is accessible without login.

#### Scenario: Rules page loads from event card
- **WHEN** a user clicks "Rules & Regulations" on a card or detail page
- **THEN** a full-page view of the event's rules content is shown

### Requirement: Two-stage conflict alert is shown during registration entry
Stage 1 of the conflict alert SHALL fire immediately when a user clicks "Register" on an event that has conflict alerts enabled — before showing the registration form. Stage 2 SHALL fire after the user submits the form if they are already registered for a linked parallel event. Both stages are soft warnings; the user can proceed.

#### Scenario: Stage 1 alert fires on Register click
- **WHEN** a user clicks "Register" on an event with conflict alert enabled
- **THEN** a modal warning is shown explaining the event has scheduling conflicts; clicking OK reveals the registration form

#### Scenario: Stage 2 alert fires when user has a conflicting existing registration
- **WHEN** a user submits the registration form for Event B and they are already registered for a linked Event A
- **THEN** a second modal shows the specific conflict ("You are registered for [Event A] which runs at the same time"); the user can go back or continue to payment

#### Scenario: Stage 2 does not fire if no existing conflict
- **WHEN** a user submits the registration form for Event B but has no registration for any event linked as parallel to Event B
- **THEN** no Stage 2 alert fires and the user proceeds directly to payment
