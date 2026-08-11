export type PropertyType = 'LODGING_HOUSE' | 'PRIVATE_CONDO'

export interface Listing {
  id: string
  title: string
  property_type: PropertyType
  location: string
  nightly_rate: number
  monthly_rate?: number
  max_guests: number
  available: boolean
  image_url: string | null
  description: string | null
  included_amenities?: string[]
  nearby_attractions?: string[]
  created_at: string
}

export interface NewListingInput {
  title: string
  property_type: PropertyType
  location: string
  nightly_rate: number
  max_guests: number
  available: boolean
  image_url?: string
  description?: string
}

export interface Booking {
  id: string
  listing_id: string
  guest_name: string
  check_in: string
  check_out: string
  guests: number
  total_price: number
  status: string
  created_at: string
}

export interface NewBookingInput {
  listing_id: string
  client_id: string
  guest_name: string
  check_in: string
  check_out: string
  guests: number
}

export interface ClientVerification {
  id: string
  client_id: string
  document_type: string
  document_id: string
  identity_verified: boolean
  compliance_accepted: boolean
  verified_at: string | null
  created_at: string
}

export interface InstapayPayment {
  id: string
  booking_id: string
  payment_reference: string
  amount: number
  currency: string
  qr_payload: string
  created_at: string
}

export interface AuditLog {
  id: string
  timestamp: string
  actor_id: string
  actor_type: string
  action: string
  target_id: string | null
  outcome: string
  detail: string | null
}

export interface FilipinoAlternative {
  code: string
  displayName: string
  description: string
}
