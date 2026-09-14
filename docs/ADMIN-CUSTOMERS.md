# Customer CRM

Status date: 2026-08-14

## Admin workspace

Open `/admin/customers` after signing in. The screen supports:

- customer search, status filters, and source filters;
- manual customer creation and editing;
- soft archive without deleting inquiry history;
- a customer profile drawer with linked inquiries;
- private notes attributed to the current admin;
- spreadsheet-safe CSV export.

## API

All endpoints require an `ADMIN` or `SUPER_ADMIN` session.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/admin/customers` | Paginated customer list |
| `GET` | `/api/v1/admin/customers/export.csv` | Filtered CSV export |
| `POST` | `/api/v1/admin/customers` | Create customer |
| `GET` | `/api/v1/admin/customers/:id` | Customer profile, inquiries, and notes |
| `PUT` | `/api/v1/admin/customers/:id` | Update customer |
| `DELETE` | `/api/v1/admin/customers/:id` | Soft archive customer |
| `POST` | `/api/v1/admin/customers/:id/notes` | Add private admin note |

## Inquiry integration

New public inquiries upsert a customer by normalized email and link the inquiry to that customer in a Prisma transaction. Existing inquiries were backfilled by migration `20260814043002_add_customer_crm`.

Formal quotation records and generated quotation documents are a separate roadmap module; a request-quote inquiry appears in the customer history but is not presented as a completed quotation.
