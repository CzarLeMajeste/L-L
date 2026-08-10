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

- `POST /api/listings` create a listing
- `GET /api/listings` list listings (optional query param: `propertyType`)
- `GET /api/listings/{id}` get listing details
- `POST /api/bookings` create a booking
- `GET /api/bookings` list bookings
