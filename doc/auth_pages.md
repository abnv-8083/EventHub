# EventHub Authentication Pages

| Page Name | Purpose | UI Components | Functionality |
| :--- | :--- | :--- | :--- |
| **Login** (`auth/login.html`) | Secure entry into the platform. | Social login buttons, email/password form, glassmorphic layout. | Verifying credentials, password recovery link, direct portal routing. |
| **Register** (`auth/register.html`) | User account creation. | Step-wise form, registration success states. | Creating attendee accounts with email verification trigger. |
| **Org Registration** (`register-organizer.html`) | Partner account creation. | Business details form, logo upload, proof of identity fields. | Applying for an organizer account (subject to admin approval). |
| **Forgot Password** (`forgot-password.html`) | Recovery trigger. | Email entry field, "Back to Login" link. | Sending password reset links to registered emails. |
| **Reset Password** (`reset-password.html`) | Recovery finalization. | New password inputs, strength meter. | Updating account password after verification. |
| **OTP Verification** (`otp-verification.html`) | MFA/Verification security. | Multi-digit input fields, resend timer. | Verifying identity for high-security actions or login. |
| **Verify Success** (`verify-email-success.html`) | Post-verification landing. | Success animations, redirection button. | Informing user of successful email or identity verification. |
