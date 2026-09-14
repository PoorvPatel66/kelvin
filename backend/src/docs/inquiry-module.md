# Kelvin Eco Products Inquiry Module

## Features

- Contact form
- Request quote
- Newsletter
- Brochure download tracking
- WhatsApp CTA tracking
- Admin dashboard
- Status management: `NEW`, `OPEN`, `REPLIED`, `CLOSED`
- Email notifications
- SMTP, Resend, and SendGrid support
- Resend notification
- CSV export
- Pagination

## Public Endpoints

```text
POST /api/v1/inquiries/contact
POST /api/v1/inquiries/request-quote
POST /api/v1/inquiries/newsletter
POST /api/v1/inquiries/brochure-download
POST /api/v1/inquiries/whatsapp
```

Short aliases:

```text
POST /api/contact
POST /api/contact/request-quote
POST /api/contact/newsletter
POST /api/contact/brochure-download
POST /api/contact/whatsapp
```

## Admin Endpoints

```text
GET   /api/v1/inquiries
GET   /api/v1/inquiries/dashboard
GET   /api/v1/inquiries/export.csv
GET   /api/v1/inquiries/:id
PATCH /api/v1/inquiries/:id/status
POST  /api/v1/inquiries/:id/notes
POST  /api/v1/inquiries/:id/resend-notification
```

All admin endpoints require:

```text
Authorization: Bearer <JWT>
```

## Main Fields

```text
name
company
email
phone
country
product
message
type
status
sourcePage
brochureUrl
whatsappUrl
metadata
```

## Request Quote Example

```json
{
  "name": "John Buyer",
  "company": "Global Food Imports LLC",
  "email": "buyer@example.com",
  "phone": "+971 555 123 456",
  "country": "United Arab Emirates",
  "product": "Paper Cups",
  "message": "Please quote 100,000 custom printed paper cups."
}
```

## Newsletter Example

```json
{
  "name": "John Buyer",
  "email": "buyer@example.com",
  "sourcePage": "/blog"
}
```

## WhatsApp CTA Example

```json
{
  "name": "John Buyer",
  "phone": "+971 555 123 456",
  "country": "United Arab Emirates",
  "product": "Paper Cups",
  "sourcePage": "/products/paper-cups"
}
```

Response includes:

```json
{
  "success": true,
  "whatsappUrl": "https://wa.me/919999999999?text=..."
}
```

## Pagination

```text
GET /api/v1/inquiries?page=1&limit=10
```

Response:

```json
{
  "success": true,
  "currentPage": 1,
  "totalPages": 3,
  "totalInquiries": 25,
  "inquiries": []
}
```

## Filters

```text
GET /api/v1/inquiries?status=NEW
GET /api/v1/inquiries?type=REQUEST_QUOTE
GET /api/v1/inquiries?product=Paper Cups
GET /api/v1/inquiries?country=UAE
GET /api/v1/inquiries?search=buyer
GET /api/v1/inquiries?from=2026-01-01&to=2026-12-31
```

## CSV Export

```text
GET /api/v1/inquiries/export.csv
```

This returns:

```text
Content-Type: text/csv
Content-Disposition: attachment; filename="kelvin-inquiries.csv"
```

## Email Notification Setup

SMTP:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASS=your_password
SMTP_FROM="Kelvin Eco Products <no-reply@kelvinecoproducts.com>"
ADMIN_NOTIFICATION_EMAIL=sales@kelvinecoproducts.com
```

Resend:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_key
SMTP_FROM="Kelvin Eco Products <no-reply@kelvinecoproducts.com>"
ADMIN_NOTIFICATION_EMAIL=sales@kelvinecoproducts.com
```

SendGrid:

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_key
SENDGRID_FROM=no-reply@kelvinecoproducts.com
ADMIN_NOTIFICATION_EMAIL=sales@kelvinecoproducts.com
```

## Line-by-Line Implementation Notes

`InquiryType` separates contact, quote, newsletter, brochure, and WhatsApp leads.

`InquiryStatus` stores the admin pipeline status.

`InquiryNote` stores internal admin notes.

`createTypedInquiry` centralizes inquiry creation and notification sending.

`sendInquiryNotification` chooses SMTP, Resend, or SendGrid based on `EMAIL_PROVIDER`.

`buildInquiryWhere` builds Prisma filters for search, status, type, product, country, and date ranges.

`getPagination` converts `page` and `limit` into Prisma `skip` and `take`.

`getInquiries` returns paginated admin results.

`getInquiryDashboard` returns total, new, open, replied, closed, and grouped type counts.

`updateInquiryStatus` sets status and timestamps for replied or closed leads.

`resendInquiryNotification` lets admin resend the notification email.

`exportInquiriesCsv` converts filtered inquiry data into CSV.

`inquiryValidators.js` validates contact, quote, newsletter, brochure, WhatsApp, status, notes, and list filters.

## Production Notes

- Run `npm install` after adding `nodemailer`.
- Run `npx prisma migrate dev --name inquiry-module`.
- Run `npx prisma generate`.
- Use a verified sender domain for SMTP, Resend, or SendGrid.
- Protect admin endpoints with JWT.
- Add rate limiting on public inquiry endpoints for spam protection.
- Consider CAPTCHA for public forms in production.
