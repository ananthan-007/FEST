# Spec Delta

## Purpose

Provides identity and access control for the platform, supporting email/password and Google OAuth login, and enforcing role-based access (Admin, Volunteer, User) across all surfaces.

## ADDED Requirements

### Requirement: User can register with email and password
The system SHALL allow a new user to create an account using a unique email address and a password. The password SHALL be stored as a secure hash (bcrypt or equivalent). The system SHALL reject registration if the email is already in use.

#### Scenario: Successful registration
- **WHEN** a new user submits a valid email and password
- **THEN** an account is created, the user is assigned the User role, and they are redirected to the profile completion screen

#### Scenario: Duplicate email rejected
- **WHEN** a user submits an email that already has an account
- **THEN** registration is rejected with an error indicating the email is already registered

#### Scenario: Weak password rejected
- **WHEN** a user submits a password shorter than 8 characters
- **THEN** registration is rejected with a clear validation message

### Requirement: User can log in with email and password
The system SHALL authenticate a user who provides a registered email and correct password, issuing a session token (JWT or secure cookie). Failed attempts SHALL return a generic error without revealing whether the email exists.

#### Scenario: Successful login
- **WHEN** a user submits a correct email and password
- **THEN** a session is created and the user is redirected to their dashboard

#### Scenario: Wrong credentials
- **WHEN** a user submits an incorrect password or unknown email
- **THEN** login is rejected with a generic "invalid credentials" message

### Requirement: User can log in or register with Google OAuth
The system SHALL support Google OAuth 2.0 as an authentication method. If the Google account email matches an existing account, the user SHALL be logged in. If no account exists, one SHALL be created with the User role and the user directed to complete their profile.

#### Scenario: Existing account via Google
- **WHEN** a user authenticates with Google and the email matches an existing account
- **THEN** the user is logged in and redirected to their dashboard

#### Scenario: New account via Google
- **WHEN** a user authenticates with Google and the email is new to the system
- **THEN** an account is created with the User role and the user is prompted to complete their profile

### Requirement: Role-based access control is enforced
The system SHALL enforce three roles: Admin, Volunteer, and User. Each request to a protected resource SHALL be validated against the requester's role. Access to Admin-only resources by non-admins SHALL be rejected with a 403 response. Access to Volunteer+Admin resources by regular Users SHALL similarly be rejected.

#### Scenario: Admin accesses admin-only resource
- **WHEN** an Admin user requests an admin-only endpoint
- **THEN** the request is fulfilled

#### Scenario: Regular user blocked from admin resource
- **WHEN** a User requests an admin-only endpoint
- **THEN** the system returns 403 Forbidden

#### Scenario: Volunteer accesses volunteer resource
- **WHEN** a Volunteer requests the QR scan endpoint
- **THEN** the request is fulfilled

#### Scenario: Unauthenticated user blocked from protected resource
- **WHEN** an unauthenticated request is made to any protected endpoint
- **THEN** the system returns 401 Unauthorized

### Requirement: Admin can assign the Volunteer role to a user
The system SHALL allow an Admin to elevate a User account to the Volunteer role. Only Admins SHALL be able to change role assignments.

#### Scenario: Admin assigns volunteer role
- **WHEN** an Admin selects a user and assigns the Volunteer role
- **THEN** the user's role is updated and they gain access to the volunteer panel

#### Scenario: Non-admin cannot assign roles
- **WHEN** a non-Admin user attempts to change another user's role
- **THEN** the request is rejected with 403 Forbidden

### Requirement: User can log out
The system SHALL allow any authenticated user to end their session. After logout the session token SHALL be invalidated.

#### Scenario: Successful logout
- **WHEN** an authenticated user logs out
- **THEN** their session token is invalidated and they are redirected to the login page
