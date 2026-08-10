# L-L
Love at the Lodge

## Backend (Java)

This repository now includes a Java backend Airbnb-style clone focused on two property categories:
- `LODGING_HOUSE`
- `PRIVATE_CONDO`

### Run locally

```bash
cd /home/runner/work/L-L/L-L/backend
mvn spring-boot:run
```

### Run tests

```bash
cd /home/runner/work/L-L/L-L/backend
mvn test
```

### API overview

- `POST /api/admin/clients/{clientId}/verify` verify client identity and mark compliance accepted (`X-Admin-Id` header required)
- `GET /api/admin/audit-logs` retrieve audit log entries (`X-Admin-Id` header required)
- `POST /api/listings` create a listing (`X-Client-Id` header required and client must be verified/compliant)
- `GET /api/listings` list listings (optional query param: `propertyType`)
- `GET /api/listings/{id}` get listing details
- `POST /api/bookings` create a booking (`X-Client-Id` header required and client must be verified/compliant)
- `GET /api/bookings` list bookings
