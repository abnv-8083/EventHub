# EventHub Exhaustive Build Flow & Implementation Roadmap

This document provides a detailed breakdown of every page in the EventHub platform, its implementation priority, core feature requirements, and database dependencies.

---

## Phase 1: Authentication & Security 🔒
*Goal: Establish the secure foundation and enable role-based portal access.*

| Page Name | Reason for Doing Now | What Features to Add | Collections Used | API Endpoints |
| :--- | :--- | :--- | :--- | :--- |
| **Login** | Entry point for all users | Social logins, role redirection, session handling. | `users`, `admins`, `organizers`, `auth_sessions` | `POST /api/auth/login` |
| **Register** | Initial user onboarding | Step-wise form, base profile creation. | `users`, `otp` | `POST /api/auth/register` |
| **OTP Verification** | Security compliance | Multi-digit input, resend timer, verification logic. | `otp`, `users` | `POST /api/auth/verify-otp` |
| **Org Registration** | Partner onboarding | Business detail collection, document upload. | `organizers` | `POST /api/auth/register-organizer` |
| **Forgot Password** | Basic account security | Email entry, recovery link generation. | `otp`, `users` | `POST /api/auth/forgot-password` |
| **Reset Password** | Recovery loop | New password entry, strength meter. | `users` | `POST /api/auth/reset-password` |
| **Verify Success** | User feedback | Success animations, auto-redirect to login. | N/A | N/A |

---

## Phase 2: Public Interface & Discovery 🌐
*Goal: Create the "Window Shop" experience to drive traffic and SEO.*

| Page Name | Reason for Doing Now | What Features to Add | Collections Used | API Endpoints |
| :--- | :--- | :--- | :--- | :--- |
| **Landing Page** | Brand identity | Hero search, featured categories, trending events. | `events`, `categories`, `comments` | `GET /api/public/events`, `GET /api/public/categories` |
| **Events Listing** | Core utility | Advanced glassmorphism filters, category sorting. | `events`, `categories` | `GET /api/public/events` |
| **Event Details** | Conversion point | Pricing cards, organizer bio, location maps. | `events`, `organizers`, `comments` | `GET /api/public/events/:id` |
| **About Us** | Trust building | Mission statements, platform stats, team view. | N/A | N/A |
| **Contact Us** | Support gateway | Support form, social links, location details. | `system_logs` | N/A |
| **Modals Showcase** | Dev utility | Reusable UI components for consistent design. | N/A | N/A |

---

## Phase 3: User Portal & Transaction Loop 🎟️
*Goal: Enable the primary business value - ticket purchasing and management.*

| Page Name | Reason for Doing Now | What Features to Add | Collections Used | API Endpoints |
| :--- | :--- | :--- | :--- | :--- |
| **User Dashboard** | User retention | Personal stats, upcoming event alerts. | `bookings`, `tickets`, `users` | `GET /api/user/profile` |
| **Booking Flow** | Revenue cycle | Stepper UI, ticket selection, coupon engine. | `events`, `coupons`, `bookings` | `POST /api/user/bookings` |
| **Payment Page** | Transaction security | Multi-gateway integration, security badges. | `payments`, `bookings` | N/A (Integrated) |
| **Success Page** | Confirmation | QR preview, order summary, thermal printing. | `bookings`, `tickets` | `GET /api/user/tickets/:id` |
| **My Tickets** | Entry management | Digital ticket list, active/past filters. | `tickets`, `events` | `GET /api/user/tickets` |
| **Ticket Details** | Utility | Secure QR display, event time/location, download. | `tickets`, `events` | `GET /api/user/tickets/:id` |
| **My Calendar** | Organization | Monthly grid, event markers, side-info panel. | `tickets`, `events` | `GET /api/user/tickets` |
| **Wishlist** | Engagement | Save-for-later logic, remove triggers. | `wishlists`, `events` | `GET /api/user/wishlist`, `POST /api/user/wishlist` |
| **My Coupons** | Marketing | Discount discovery, copy-to-clipboard. | `coupons` | `GET /api/user/coupons` |
| **Refund Center** | Gateway for cancellations | List of upcoming events with status badges. | `bookings`, `events` | `GET /api/user/bookings/refundable` |
| **Cancel Detail** | Granular control | Multi-attendee checkbox cards, live refund summary. | `tickets`, `bookings` | `GET /api/user/bookings/:id/refund-info` |
| **Cancel Confirm** | Final review | Policy reasoning dropdown, NET refund display. | `refunds`, `bookings` | `POST /api/user/bookings/:id/refund-preview` |
| **Cancel Success** | Confirmation | Visual checkmarks, next steps, track refund link. | `refunds` | `POST /api/user/bookings/:id/cancel` |
| **Refund Status** | Transparency | Progress stepper for bank processing. | `refunds`, `bookings` | `POST /api/user/refunds` |
| **Manage Profile** | Personalization | Avatar upload, bio editor, social links. | `users` | `GET /api/user/profile`, `PUT /api/user/profile` |

---

## Phase 4: Organizer Management Portal 📈
*Goal: Empower partners to manage their events and revenue.*

| Page Name | Reason for Doing Now | What Features to Add | Collections Used | API Endpoints |
| :--- | :--- | :--- | :--- | :--- |
| **Org Dashboard** | Performance tracking | Revenue charts, real-time sold-out alerts. | `events`, `bookings`, `payouts` | `GET /api/organizer/profile` |
| **Create Event** | Content supply | Form validation, banner upload, ticketing logic. | `events`, `categories` | `POST /api/organizer/events` |
| **Manage Events** | Control | Lifecycle management (publish, pause, end). | `events` | `GET /api/organizer/events` (Implicit) |
| **Attendee List** | Operations | Filterable tables, CSV export, profile modals. | `bookings`, `users`, `tickets` | N/A |
| **Refunds (Org)** | Dispute handling | Approve/reject buttons, reason panel. | `refunds`, `payments` | N/A |
| **Revenue** | Financials | Earnings breakdown, payout status, tax logs. | `payouts`, `payments` | N/A |
| **Org Profile** | Brand control | Logo management, team details, social proof. | `organizers` | `GET /api/organizer/profile` |
| **Ticket Scanner** | Event execution | Camera-based QR scanning, entry validation. | `tickets` | `POST /api/organizer/scanner/verify` |

---

## Phase 5: Master Admin Governance 🛡️
*Goal: System-wide monitoring, compliance, and strategic control.*

| Page Name | Reason for Doing Now | What Features to Add | Collections Used | API Endpoints |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Dashboard** | Oversight | Global revenue, health alerts, user stats. | All Collections | N/A |
| **Approvals** | Quality control | Multi-tab approval queue (events/orgs). | `events`, `organizers` | `GET /api/admin/approvals/events` |
| **Manage Users** | Policy enforcement | Searchable user list, ban/active toggles. | `users` | N/A |
| **Organizers (Admin)** | Compliance | Partner directory, revenue ranking. | `organizers` | N/A |
| **Coupons Admin** | Platform growth | Code creator, usage analytics, expiry. | `coupons` | N/A |
| **Global Refunds** | Financial audit | Bulk processing, bank transfer logs. | `refunds`, `payments` | N/A |
| **Master Reports** | Strategic insights | BI charts, demographic breakdowns. | All Data | N/A |
| **System Logs** | Technical monitor | Audit trails, error tracking, IP logs. | `system_logs` | N/A |
| **Settings** | Configuration | Fee management, API keys, maintenance mode. | `system_logs` | `POST /api/admin/categories` |
| **Admin Profile** | Account security | Admin role details, secure email settings. | `admins` | N/A |
