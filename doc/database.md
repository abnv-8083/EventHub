# EventHub Database Schema

This document outlines the database structure for the EventHub platform, including collections, fields, purposes, and relationships.

---

## 1. Users Collection

### Purpose
Stores all registered platform users. Users can:
- Browse events
- Book tickets
- Cancel tickets
- Request refunds
- Comment on events
- Maintain wishlist

### Fields
| Field | Type | Purpose |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique user identifier |
| `name` | String | Full name |
| `email` | String | Login email |
| `phone` | String | User phone number |
| `password` | String | Encrypted password |
| `membership_tier` | String | User membership level |
| `avatar_url` | String | Profile picture |
| `city` | String | User location |
| `loyalty_points` | Integer | Reward points |
| `interests` | Array | Preferred event categories |
| `status` | String | active / blocked |
| `created_at` | Date | Account creation date |

### Relations
- **1 : N**
- `users._id` → `bookings.user_id`
- `users._id` → `tickets.user_id`
- `users._id` → `payments.user_id`
- `users._id` → `wishlists.user_id`
- `users._id` → `comments.user_id`
- `users._id` → `refunds.user_id`
- `users._id` → `otp.user_id`
- `users._id` → `auth_sessions.user_id`

---

## 2. Admins Collection

### Purpose
Stores system administrators responsible for managing the platform. Admins handle:
- Event approval
- Organizer approval
- Refund approval
- Coupon creation
- Monitoring logs

### Fields
| Field | Type | Purpose |
| :--- | :--- | :--- |
| `_id` | ObjectId | Admin identifier |
| `name` | String | Admin name |
| `email` | String | Login email |
| `admin_id` | String | Unique admin code |
| `last_login` | Date | Last login time |
| `created_at` | Date | Account creation |

### Relations
- **1 : N**
- `admins._id` → `events.approved_by`
- `admins._id` → `organizers.approved_by`
- `admins._id` → `refunds.approved_by`
- `admins._id` → `coupons.created_by`
- `admins._id` → `system_logs.actor_id`

---

## 3. Organizers Collection

### Purpose
Stores event organizers who create and manage events.

### Fields
| Field | Type | Purpose |
| :--- | :--- | :--- |
| `_id` | ObjectId | Organizer ID |
| `org_name` | String | Organization name |
| `contact_name` | String | Primary contact |
| `email` | String | Email address |
| `phone` | String | Contact phone |
| `category` | ObjectId | Category specialization |
| `website` | String | Website |
| `social_links` | Object | Social media |
| `verified` | Boolean | Verification status |
| `status` | String | pending / approved / suspended |
| `created_at` | Date | Created date |
| `approved_by` | ObjectId | Admin approval |

### Relations
- **1 : N**
- `organizers._id` → `events.organizer_id`
- `organizers._id` → `payouts.organizer_id`

---

## 4. Categories Collection

### Purpose
Stores event categories used for filtering (e.g., Music, Tech, Sports, Business, Education).

### Fields
| Field | Type | Purpose |
| :--- | :--- | :--- |
| `_id` | ObjectId | Category ID |
| `name` | String | Category name |
| `description` | String | Category description |
| `icon` | String | UI icon |
| `created_at` | Date | Created date |

### Relations
- **1 : N**
- `categories._id` → `events.category_id`
- `categories._id` → `organizers.category`

---

## 5. Events Collection

### Purpose
Stores comprehensive event information including venue, schedule, and ticket types.

### Fields
| Field | Type | Purpose |
| :--- | :--- | :--- |
| `_id` | ObjectId | Event ID |
| `title` | String | Event name |
| `description` | String | Event description |
| `organizer_id` | ObjectId | Organizer |
| `category_id` | ObjectId | Event category |
| `banner_url` | String | Event banner |
| `venue` | Object | Venue details |
| `start_date` | Date | Event start |
| `end_date` | Date | Event end |
| `capacity` | Integer | Maximum seats |
| `tickets_sold` | Integer | Tickets sold |
| `status` | String | pending/live/ended |
| `is_cancellable` | Boolean | Whether refunds are allowed for this event |
| `refund_policy` | Object | Embedded: { deadline_hours: Int, refund_percentage: Double, platform_fee: Double } |
| `created_at` | Date | Created date |

### Embedded Ticket Types (`ticket_types[]`)
```json
{
  "ticket_types": [
    {
      "_id": ObjectId,
      "name": "VIP",
      "price": 2000,
      "quantity": 100,
      "remaining_count": 70
    }
  ]
}
```
- **Relation:** `events` → `ticket_types`
- **Type:** 1 : N (embedded)

---

## 6. Bookings Collection

### Purpose
Stores ticket purchase transactions. One booking may contain multiple tickets.

### Fields
| Field | Type | Purpose |
| :--- | :--- | :--- |
| `_id` | ObjectId | Booking ID |
| `order_id` | String | Unique order number |
| `user_id` | ObjectId | User |
| `event_id` | ObjectId | Event |
| `ticket_type_id` | ObjectId | Ticket type |
| `quantity` | Integer | Number of tickets |
| `amount_paid` | Double | Total payment |
| `payment_method` | String | Payment gateway |
| `booking_status` | String | confirmed / cancelled / partially_cancelled |
| `refund_status` | String | none / pending / partially_refunded / fully_refunded |
| `total_refunded_amount` | Double | Running total of money returned for this order |
| `coupon_id` | ObjectId | Discount applied |
| `cancelled_tickets` | Integer | Number of individual tickets cancelled |
| `attendees_summary` | Array | Quick reference to attendee names (embedded) |
| `created_at` | Date | Booking date |

### Relations
- **1 : N**
- `bookings._id` → `tickets.booking_id`
- `bookings._id` → `payments.booking_id`
- `bookings._id` → `refunds.booking_id`
- One `booking` can have multiple `tickets`, each with unique attendee details.

---

## 7. Tickets Collection

### Purpose
Stores individual tickets generated from bookings. Status can be active, cancelled, or used.

### Fields
| Field | Type | Purpose |
| :--- | :--- | :--- |
| `_id` | ObjectId | Ticket ID |
| `ticket_number` | String | Unique ticket |
| `booking_id` | ObjectId | Booking reference |
| `event_id` | ObjectId | Event |
| `user_id` | ObjectId | Ticket owner |
| `ticket_type_id` | ObjectId | Ticket type |
| `attendee_name` | String | Full name of the attendee |
| `attendee_phone` | String | Phone number of the attendee |
| `qr_code` | String | Individual QR code per person |
| `status` | String | active / cancelled / used |
| `cancelled` | Boolean | Cancel flag for this specific person |
| `cancelled_at` | Date | Time of individual cancellation |
| `refund_status` | String | refund state for this ticket |
| `cancellation_reason` | String | Why this individual ticket was cancelled |
| `refund_id` | ObjectId | Reference to the specific refund record |
| `checked_in` | Boolean | Entry scanned |
| `checked_in_at` | Date | Entry time |
| `created_at` | Date | Ticket creation |

### Relations
- **N : 1**
- `tickets.booking_id` → `bookings._id`
- `tickets.user_id` → `users._id`
- `tickets.event_id` → `events._id`
- `tickets.ticket_type_id` → `events.ticket_types._id`

---

## 8. Payments Collection

### Purpose
Stores payment transactions.

### Fields
| Field | Type | Purpose |
| :--- | :--- | :--- |
| `_id` | ObjectId | Payment ID |
| `booking_id` | ObjectId | Booking |
| `user_id` | ObjectId | User |
| `event_id` | ObjectId | Event |
| `payment_gateway` | String | Razorpay/PayPal |
| `gateway_order_id` | String | Gateway order |
| `gateway_payment_id` | String | Gateway payment |
| `amount` | Double | Payment amount |
| `currency` | String | Currency |
| `status` | String | success/failed |
| `paid_at` | Date | Payment time |

---

## 9. Coupons Collection

### Purpose
Stores discount coupons.

### Fields
| Field | Type |
| :--- | :--- |
| `_id` | ObjectId |
| `code` | String |
| `discount_type` | String |
| `discount_value` | Integer |
| `expiry_date` | Date |
| `max_uses` | Integer |
| `used_count` | Integer |
| `applicable_events` | Array |
| `status` | String |
| `created_by` | ObjectId |

### Relation
- `coupons._id` → `bookings.coupon_id`

---

## 10. Refunds Collection

### Purpose
Stores refund requests. Refunds are handled per ticket.

### Fields
| Field | Type |
| :--- | :--- |
| `_id` | ObjectId |
| `ticket_id` | ObjectId |
| `booking_id` | ObjectId |
| `user_id` | ObjectId |
| `event_id` | ObjectId |
| `refund_amount` | Double | Final amount returned to user |
| `platform_fee` | Double | Deducted cancellation fee (e.g., $2.50) |
| `reason_category` | String | Category (e.g., Schedule Conflict) |
| `user_comments` | String | Additional feedback from user |
| `status` | String | pending / processing / completed / rejected |
| `requested_at` | Date | Requested date |
| `policy_agreed` | Boolean | User confirmed irreversible action & policy |
| `tickets_affected` | Array | [ObjectId] of tickets included in this request |
| `approved_by` | ObjectId | Admin approval |

### Relation
- `tickets._id` → `refunds.ticket_id`

---

## 11. Wishlists Collection

### Purpose
Stores user-saved events.

### Fields
- `_id`
- `user_id`
- `event_id`
- `created_at`

### Relation
- **Many-to-Many:** `users` ↔ `events`

---

## 12. Comments Collection

### Purpose
Stores event reviews and ratings.

### Fields
- `_id`
- `event_id`
- `user_id`
- `comment`
- `rating`
- `likes`
- `created_at`

### Relation
- `users` ↔ `events`

---

## 13. Payouts Collection

### Purpose
Tracks organizer payouts.

### Fields
- `_id`
- `organizer_id`
- `amount`
- `platform_fee`
- `net_amount`
- `status`
- `created_at`

---

## 14. System Logs Collection

### Purpose
Tracks system activity and logs.

### Fields
- `_id`
- `actor_id`
- `level`
- `message`
- `ip`
- `created_at`

---

## 15. OTP Collection

### Purpose
Handles OTP verification for security.

### Fields
- `_id`
- `email`
- `user_id`
- `otp_code`
- `purpose`
- `expires_at`
- `verified`
- `created_at`

---

## 16. Auth Sessions Collection

### Purpose
Tracks login sessions and tokens.

### Fields
- `_id`
- `user_id`
- `token`
- `ip_address`
- `created_at`
- `expires_at`
