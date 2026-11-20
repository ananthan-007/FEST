# Spec Delta

## Purpose

Handles per-event payment collection via Razorpay, automatic webhook-based verification, and admin-triggered manual verification as a fallback, ensuring every registration has a confirmed payment status before the cadet's events appear as verified on their QR scan.

## ADDED Requirements

### Requirement: A Razorpay order is created for each registration
The system SHALL create a unique Razorpay order for each registration at the time the registration form is submitted and validated. The order amount SHALL equal the event's registration fee. The Razorpay payment popup SHALL be presented to the user immediately.

#### Scenario: Order created and popup shown
- **WHEN** a valid registration is submitted
- **THEN** a Razorpay order is created server-side and the client opens the Razorpay payment popup with the correct amount

#### Scenario: Fee matches event configuration
- **WHEN** the Razorpay order is created for a team event
- **THEN** the order amount equals the per-team registration fee (not per-member)

### Requirement: Razorpay webhook auto-verifies payment
The system SHALL expose a webhook endpoint that receives Razorpay payment events. On receiving a `payment.captured` event, the system SHALL verify the Razorpay signature, match the payment to the corresponding registration, and update the registration status to "Payment Verified".

#### Scenario: Webhook verifies payment
- **WHEN** Razorpay fires a `payment.captured` webhook with a valid signature for a known order
- **THEN** the matching registration's status is updated to "Payment Verified"

#### Scenario: Invalid webhook signature rejected
- **WHEN** a webhook request arrives with an invalid Razorpay signature
- **THEN** it is rejected with 400 Bad Request and no registration is updated

#### Scenario: Unknown order ID in webhook ignored gracefully
- **WHEN** a webhook references an order ID not found in the database
- **THEN** the event is logged and a 200 response is returned to prevent Razorpay retries

### Requirement: Admin can manually verify a payment via Razorpay API
The system SHALL provide a "Verify Payment" action on each pending-payment registration in the admin panel. When triggered, the system SHALL call the Razorpay Fetch Payment API for the associated order, compare the amount and status, and update the registration status to "Payment Verified" if confirmed.

#### Scenario: Manual verify succeeds
- **WHEN** an Admin clicks "Verify Payment" and Razorpay confirms the payment is captured with the correct amount
- **THEN** the registration status is updated to "Payment Verified"

#### Scenario: Manual verify finds payment not completed
- **WHEN** an Admin clicks "Verify Payment" and Razorpay returns a status other than "captured"
- **THEN** the registration remains in "Pending Payment" and the Admin sees the Razorpay-returned status

### Requirement: Registration fee is per person for individual events and per team for team events
The system SHALL apply the registration fee at the registration level: for individual events, the fee is charged per registering user; for team events, one fee is charged to the team leader covering the entire team.

#### Scenario: Individual event — single charge
- **WHEN** a user registers individually for an event with a fee of ₹100
- **THEN** a Razorpay order for ₹100 is created for that user

#### Scenario: Team event — leader pays for whole team
- **WHEN** a team leader registers a 6-member team for an event with a team fee of ₹500
- **THEN** a single Razorpay order for ₹500 is created charged to the leader

### Requirement: Fest-wide registration deadline is enforced
The system SHALL prevent new registrations after a globally configured registration deadline date/time. The deadline is set by Admin. Existing pending-payment registrations may still be paid after the deadline.

#### Scenario: Registration after deadline blocked
- **WHEN** a user attempts to register for any event after the fest-wide deadline has passed
- **THEN** registration is rejected with a message stating the registration period has closed

#### Scenario: Payment of pending registration after deadline allowed
- **WHEN** a user completes payment for a registration created before the deadline, even if the deadline has now passed
- **THEN** the payment is processed normally
