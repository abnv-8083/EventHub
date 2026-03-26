# EventHub 4-Week Balanced Implementation Roadmap
## Complete 47-Module Plan · ~12 Tasks Per Week

All tasks are ordered by dependency chain. A module is only built after everything it relies on is ready.

---

## 🗓️ Week 1: Foundation, Auth & Public Shell (12 tasks)
*Database, authentication, and all public-facing pages. No portal or transactional work begins here.*

| Page/Module | Portal | Depends On |
| :--- | :--- | :--- |
| **Database Schema** | Initialize all 16 collections and relationships. | — |
| **Core UI Components & Modals** | Modals showcase and shared platform layouts. | — |
| **Login** | Auth | DB Schema |
| **Register (Attendee)** | Auth | DB Schema |
| **Register (Organizer)** | Auth | DB Schema |
| **OTP Verification** | Auth | Register |
| **Verify Email Success** | Auth | OTP |
| **Forgot Password** | Auth | Login |
| **Reset Password** | Auth | Forgot Password |
| **Landing Page** | Public | Core UI |
| **About Us** | Public | Core UI |
| **Contact Us** | Public | Core UI |

---

## 🗓️ Week 2: Organizer Portal & Admin Foundation (12 tasks)
*Organizers create and manage events. Admins approve them. Events must exist before any attendee flows can work.*

| Page/Module | Portal | Depends On |
| :--- | :--- | :--- |
| **Org Dashboard** | Organizer | Login |
| **Create Event** | Organizer | Org Dashboard, DB Schema |
| **Manage Events** | Organizer | Create Event |
| **Org Profile** | Organizer | Login |
| **Organizer Refunds** | Organizer | Create Event |
| **Revenue & Payouts** | Organizer | Create Event |
| **Admin Dashboard** | Admin | Create Event |
| **Approvals (Events & Orgs)** | Admin | Admin Dashboard |
| **Manage Users** | Admin | Admin Dashboard |
| **Manage Organizers** | Admin | Admin Dashboard |
| **Admin Profile** | Admin | Login |
| **Events Listing Page** | Public | Create Event, Approvals |

---

## 🗓️ Week 3: Attendee Journey, Booking & Operations (12 tasks)
*Events are live. Build the full discovery, booking, ticketing, and on-site pipeline.*

| Page/Module | Portal | Depends On |
| :--- | :--- | :--- |
| **Event Details Page** | Public | Events Listing |
| **User Dashboard** | User | Login |
| **Manage Profile** | User | Login |
| **Wishlist** | User | Login, Event Details |
| **Booking Flow (Ticket Select + Coupon)** | User | Event Details |
| **Add Attendees** | User | Booking Flow |
| **Payment** | User | Add Attendees |
| **Booking Success** | User | Payment |
| **My Tickets (List)** | User | Payment |
| **Ticket Details (QR)** | User | My Tickets |
| **Attendee List (Organizer)** | Organizer | Booking Flow |
| **Ticket Scanner** | Organizer | Ticket Details (QR) |

---

## 🗓️ Week 4: Refunds, Personal Tools & Admin Strategy (11 tasks)
*Platform-wide finish: personal account tools, refund lifecycle, and admin analytics.*

| Page/Module | Portal | Depends On |
| :--- | :--- | :--- |
| **My Calendar** | User | My Tickets |
| **My Coupons / Coupon Wallet** | User | Login |
| **Refund Center (Booking List)** | Multi-step cancellations and Refund Status tracker. | Payment Gateway, Ticket Center |
| **Cancel Detail (Per Attendee)** | Refund Center | — |
| **Cancel Confirm (Summary)** | Cancel Detail | — |
| **Cancel Success** | Cancel Confirm | — |
| **Refund Status Tracker** | Cancel Success | — |
| **Coupons Admin** | Admin | Admin Dashboard |
| **Global Refunds (Escrow)** | Admin | Organizer Refunds |
| **Master Reports (BI)** | Admin | Admin Dashboard |
| **System Logs & Settings** | System logs, audit trails, and error tracking. | All of the above |
