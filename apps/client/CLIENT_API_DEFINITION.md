# Client API Roadmap (Planned)

## Purpose

This document defines the full API scope planned for the Client App (Parent/Student side), not only APIs that already exist today.

## Base

- Prefix: `/api/v1`
- Default host (dev): `http://localhost:4000`
- Client env: `NEXT_PUBLIC_API_URL`

## Status Legend

- `PLANNED`: API is part of roadmap, not guaranteed to exist yet.
- `PARTIAL`: API exists but payload/behavior is expected to evolve.
- `LIVE`: API is already stable in backend.

---

## 1) Authentication

### POST `/auth/login` (`PARTIAL`)

Login with email/password.

### POST `/auth/verify` (`PARTIAL`)

Verify JWT validity and payload.

### POST `/auth/refresh` (`PLANNED`)

Issue a new access token from refresh token.

### POST `/auth/logout` (`PLANNED`)

Revoke session/refresh token.

### POST `/auth/forgot-password` (`PLANNED`)

Send password reset token.

### POST `/auth/reset-password` (`PLANNED`)

Reset password by reset token.

---

## 2) Profile & Account

### GET `/users/me` (`PARTIAL`)

Get current user profile.

### PATCH `/users/me` (`PLANNED`)

Update profile fields: name, phone, avatar.

### PATCH `/users/me/password` (`PLANNED`)

Change current password.

### GET `/users/me/notifications/settings` (`PLANNED`)

Get notification settings.

### PATCH `/users/me/notifications/settings` (`PLANNED`)

Update notification settings.

---

## 3) Student Linking & Management (Parent Side)

### GET `/students` (`PLANNED`)

List students linked to current parent.

### POST `/students` (`PLANNED`)

Create/link a student profile.

### GET `/students/:studentId` (`PLANNED`)

Get student detail.

### PATCH `/students/:studentId` (`PLANNED`)

Update student info.

### DELETE `/students/:studentId` (`PLANNED`)

Unlink/deactivate student.

### POST `/students/:studentId/link-card` (`PLANNED`)

Bind canteen card number to student.

### DELETE `/students/:studentId/link-card` (`PLANNED`)

Unbind card from student.

### GET `/students/:studentId/orders` (`PLANNED`)

Get order history of one student.

### GET `/students/:studentId/spending-summary` (`PLANNED`)

Get spending aggregate by period.

---

## 4) Menu, Categories, Product Discovery

### GET `/categories` (`PLANNED`)

List active categories for menu.

### GET `/products` (`PLANNED`)

List products with filters.

Query params (planned):

- `q`: keyword
- `categoryId`
- `isFeatured`
- `minPrice`, `maxPrice`
- `page`, `limit`, `sortBy`, `sortOrder`

### GET `/products/:productId` (`PLANNED`)

Get product detail with nutrition, stock status.

### GET `/products/featured` (`PLANNED`)

Get featured products.

### GET `/products/recommendations` (`PLANNED`)

Get personalized recommendations.

---

## 5) Cart

### GET `/cart` (`PLANNED`)

Get current cart (server-side cart).

### POST `/cart/items` (`PLANNED`)

Add item to cart.

### PATCH `/cart/items/:itemId` (`PLANNED`)

Update item quantity/notes.

### DELETE `/cart/items/:itemId` (`PLANNED`)

Remove item from cart.

### DELETE `/cart` (`PLANNED`)

Clear cart.

### POST `/cart/validate` (`PLANNED`)

Validate stock, voucher and final pricing before checkout.

---

## 6) Orders & Checkout

### POST `/orders` (`PLANNED`)

Create order from cart/direct buy.

### GET `/orders` (`PLANNED`)

List current user orders.

Query params (planned):

- `status`
- `studentId`
- `fromDate`, `toDate`
- `page`, `limit`

### GET `/orders/:orderId` (`PLANNED`)

Get order detail.

### PATCH `/orders/:orderId/cancel` (`PLANNED`)

Cancel order if still cancellable.

### GET `/orders/:orderId/tracking` (`PLANNED`)

Get order timeline/status events.

### POST `/orders/:orderId/reorder` (`PLANNED`)

Create a new order from an existing one.

---

## 7) Wallet, Top-up, Transactions

### GET `/wallet` (`PLANNED`)

Get current wallet balance and lock status.

### GET `/wallet/transactions` (`PLANNED`)

List wallet transactions.

Query params (planned):

- `type` (`TOP_UP`, `PURCHASE`, `REFUND`, `ADJUSTMENT`)
- `fromDate`, `toDate`
- `page`, `limit`

### POST `/top-up-requests` (`PLANNED`)

Create top-up request (manual admin approval flow).

### GET `/top-up-requests` (`PLANNED`)

List top-up requests of current user.

### GET `/top-up-requests/:id` (`PLANNED`)

Get top-up request detail.

### PATCH `/top-up-requests/:id/cancel` (`PLANNED`)

Cancel pending top-up request.

---

## 8) Vouchers & Promotions

### GET `/vouchers/available` (`PLANNED`)

Get vouchers available for current user.

### POST `/vouchers/validate` (`PLANNED`)

Validate voucher code for current cart/order.

### POST `/orders/:orderId/apply-voucher` (`PLANNED`)

Apply voucher to order (before payment confirm).

### DELETE `/orders/:orderId/apply-voucher` (`PLANNED`)

Remove applied voucher.

### GET `/promotions/banners` (`PLANNED`)

Get campaign banners/announcements for home screen.

---

## 9) Notifications

### GET `/notifications` (`PLANNED`)

List user notifications.

### PATCH `/notifications/:id/read` (`PLANNED`)

Mark one notification as read.

### PATCH `/notifications/read-all` (`PLANNED`)

Mark all notifications as read.

### DELETE `/notifications/:id` (`PLANNED`)

Delete a notification.

---

## 10) Reports For Parent/Student View

### GET `/reports/spending-summary` (`PLANNED`)

Parent spending summary by day/week/month.

### GET `/reports/student-consumption` (`PLANNED`)

Student food purchase summary.

### GET `/reports/nutrition-overview` (`PLANNED`)

Nutrition overview from purchased items.

---

## 11) Operational APIs (Optional but expected)

### GET `/health` (`PLANNED`)

Basic API health check.

### GET `/config/client-bootstrap` (`PLANNED`)

Return bootstrap config for client app (feature flags, app version, maintenance mode).

---

## Unified Error Contract (Planned)

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "BadRequest",
  "timestamp": "2026-03-12T00:00:00.000Z",
  "path": "/api/v1/orders"
}
```

---

## Notes

- This file is roadmap-first and intentionally broader than current backend implementation.
- Role focus for this file: `PARENT`, `STUDENT` (client app).
- CMS/admin-only APIs are defined in a separate catalog to avoid mixing scopes.
