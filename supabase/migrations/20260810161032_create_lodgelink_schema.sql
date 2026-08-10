/*
# LodgeLink — core schema (single-tenant, no auth)

1. New Tables
- `listings` — lodging houses and private condos available for booking.
  - id (uuid pk), title, property_type (LODGING_HOUSE | PRIVATE_CONDO),
    location, nightly_rate (numeric), max_guests (int), available (bool),
    image_url (text), description (text), created_at.
- `client_verifications` — identity verification + compliance acceptance records.
  - id (uuid pk), client_id (text, unique), document_type, document_id,
    identity_verified (bool), compliance_accepted (bool), verified_at.
- `bookings` — a guest booking against a listing.
  - id (uuid pk), listing_id (fk -> listings), guest_name, check_in (date),
    check_out (date), guests (int), total_price (numeric), status (text),
    created_at.
- `instapay_payments` — InstaPay QR payment records for a booking.
  - id (uuid pk), booking_id (fk -> bookings), payment_reference (text unique),
    amount (numeric), currency (text), qr_payload (text), created_at.
- `audit_logs` — append-only audit trail of admin + client actions.
  - id (uuid pk), timestamp, actor_id, actor_type, action, target_id, outcome, detail.

2. Security
- Enable RLS on every table.
- This is a no-sign-in demo app; data is intentionally shared/public, so policies
  allow anon + authenticated full CRUD (USING (true) / WITH CHECK (true)).

3. Notes
- No user_id / auth.uid() — single-tenant demo.
- All monetary amounts stored as numeric.
- audit_logs is append-only by convention (UI never updates/deletes rows).
*/

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  property_type text NOT NULL CHECK (property_type IN ('LODGING_HOUSE', 'PRIVATE_CONDO')),
  location text NOT NULL,
  nightly_rate numeric(12,2) NOT NULL DEFAULT 0,
  max_guests int NOT NULL DEFAULT 1,
  available boolean NOT NULL DEFAULT true,
  image_url text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_listings" ON listings;
CREATE POLICY "anon_select_listings" ON listings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_listings" ON listings;
CREATE POLICY "anon_insert_listings" ON listings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_listings" ON listings;
CREATE POLICY "anon_update_listings" ON listings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_listings" ON listings;
CREATE POLICY "anon_delete_listings" ON listings FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS client_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL UNIQUE,
  document_type text NOT NULL,
  document_id text NOT NULL,
  identity_verified boolean NOT NULL DEFAULT false,
  compliance_accepted boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE client_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_verifications" ON client_verifications;
CREATE POLICY "anon_select_verifications" ON client_verifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_verifications" ON client_verifications;
CREATE POLICY "anon_insert_verifications" ON client_verifications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_verifications" ON client_verifications;
CREATE POLICY "anon_update_verifications" ON client_verifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_verifications" ON client_verifications;
CREATE POLICY "anon_delete_verifications" ON client_verifications FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests int NOT NULL DEFAULT 1,
  total_price numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'CONFIRMED',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_bookings" ON bookings;
CREATE POLICY "anon_update_bookings" ON bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_bookings" ON bookings;
CREATE POLICY "anon_delete_bookings" ON bookings FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS instapay_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  payment_reference text NOT NULL UNIQUE,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'PHP',
  qr_payload text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE instapay_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_payments" ON instapay_payments;
CREATE POLICY "anon_select_payments" ON instapay_payments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_payments" ON instapay_payments;
CREATE POLICY "anon_insert_payments" ON instapay_payments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_payments" ON instapay_payments;
CREATE POLICY "anon_update_payments" ON instapay_payments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_payments" ON instapay_payments;
CREATE POLICY "anon_delete_payments" ON instapay_payments FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  actor_id text NOT NULL,
  actor_type text NOT NULL,
  action text NOT NULL,
  target_id text,
  outcome text NOT NULL DEFAULT 'SUCCESS',
  detail text
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_audit_logs" ON audit_logs;
CREATE POLICY "anon_select_audit_logs" ON audit_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_audit_logs" ON audit_logs;
CREATE POLICY "anon_insert_audit_logs" ON audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_audit_logs" ON audit_logs;
CREATE POLICY "anon_update_audit_logs" ON audit_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_audit_logs" ON audit_logs;
CREATE POLICY "anon_delete_audit_logs" ON audit_logs FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON instapay_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
