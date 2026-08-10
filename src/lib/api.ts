import { isSupabaseConfigured, supabase } from './supabase'
import type {
  AuditLog,
  Booking,
  ClientVerification,
  FilipinoAlternative,
  InstapayPayment,
  Listing,
  NewBookingInput,
  NewListingInput,
  PropertyType,
} from './types'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export const FILIPINO_ALTERNATIVES: FilipinoAlternative[] = [
  { code: 'GCASH', displayName: 'GCash', description: 'E-wallet cash-in or QR payment' },
  { code: 'MAYA', displayName: 'Maya', description: 'Wallet or card-linked digital payments' },
  { code: 'PESONET', displayName: 'PESONet', description: 'Batch bank transfer for larger amounts' },
  { code: 'OTC_BAYAD_CENTER', displayName: 'Bayad Center', description: 'Over-the-counter cash payment option' },
]

const TURNOVER_HOURS = 2
const turnoverKey = (listingId: string) => `lodgelink-turnover-${listingId}`
const isInTurnover = (listingId: string) => {
  const blockedUntil = Number(localStorage.getItem(turnoverKey(listingId)))
  return Number.isFinite(blockedUntil) && blockedUntil > Date.now()
}

const EXAMPLE_LISTINGS: Listing[] = [
  {
    id: 'demo-iloilo-heritage-house',
    title: 'Casa Iloilo Heritage Stay',
    property_type: 'LODGING_HOUSE',
    location: 'Iloilo City, Iloilo',
    nightly_rate: 3600,
    max_guests: 6,
    available: true,
    image_url: 'https://images.pexels.com/photos/36930158/pexels-photo-36930158.jpeg',
    description: 'A character-filled stay near Iloilo heritage streets, local food, and the river esplanade.',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-antique-hillside-lodge',
    title: 'Tibiao Hillside Lodge',
    property_type: 'LODGING_HOUSE',
    location: 'Tibiao, Antique',
    nightly_rate: 2900,
    max_guests: 5,
    available: true,
    image_url: 'https://images.pexels.com/photos/29793237/pexels-photo-29793237.jpeg',
    description: 'A peaceful hillside base for rivers, hot kawa baths, and the green mountains of Antique.',
    created_at: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'demo-boracay-coastal-condo',
    title: 'White Beach Coastal Condo',
    property_type: 'PRIVATE_CONDO',
    location: 'Malay, Aklan',
    nightly_rate: 5200,
    max_guests: 4,
    available: true,
    image_url: 'https://images.pexels.com/photos/10085110/pexels-photo-10085110.jpeg',
    description: 'A bright private condo near Boracay sunsets, island dining, and White Beach access.',
    created_at: '2025-01-03T00:00:00.000Z',
  },
  {
    id: 'demo-roxas-bay-condo',
    title: 'Roxas Bayfront Condo',
    property_type: 'PRIVATE_CONDO',
    location: 'Roxas City, Capiz',
    nightly_rate: 2600,
    max_guests: 3,
    available: true,
    image_url: 'https://images.pexels.com/photos/38186695/pexels-photo-38186695.jpeg',
    description: 'A relaxed coastal condo close to Roxas seafood markets and the bayfront promenade.',
    created_at: '2025-01-04T00:00:00.000Z',
  },
]

export const api = {
  async getListings(propertyType?: PropertyType): Promise<Listing[]> {
    if (!isSupabaseConfigured) {
      const availableExamples = EXAMPLE_LISTINGS.filter((listing) => !isInTurnover(listing.id))
      return propertyType ? availableExamples.filter((listing) => listing.property_type === propertyType) : availableExamples
    }
    let query = supabase.from('listings').select('*').order('created_at', { ascending: true })
    if (propertyType) query = query.eq('property_type', propertyType)
    const { data, error } = await query
    if (error) {
      if (error.code === 'PGRST205') {
        const availableExamples = EXAMPLE_LISTINGS.filter((listing) => !isInTurnover(listing.id))
        return propertyType ? availableExamples.filter((listing) => listing.property_type === propertyType) : availableExamples
      }
      throw new ApiError(500, error.message)
    }
    const listings = data as Listing[]
    if (listings.length === 0) {
      const availableExamples = EXAMPLE_LISTINGS.filter((listing) => !isInTurnover(listing.id))
      return propertyType ? availableExamples.filter((listing) => listing.property_type === propertyType) : availableExamples
    }
    return listings.map((listing) => isInTurnover(listing.id) ? { ...listing, available: false } : listing)
  },

  async getListing(id: string): Promise<Listing> {
    if (!isSupabaseConfigured) {
      const listing = EXAMPLE_LISTINGS.find((item) => item.id === id)
      if (!listing) throw new ApiError(404, `Listing ${id} was not found`)
      return isInTurnover(id) ? { ...listing, available: false } : listing
    }
    const { data, error } = await supabase.from('listings').select('*').eq('id', id).maybeSingle()
    if (error) {
      if (error.code === 'PGRST205') {
        const example = EXAMPLE_LISTINGS.find((listing) => listing.id === id)
        if (example) return example
      }
      throw new ApiError(500, error.message)
    }
    if (!data) {
      const example = EXAMPLE_LISTINGS.find((listing) => listing.id === id)
      if (example) return example
      throw new ApiError(404, `Listing ${id} was not found`)
    }
    return isInTurnover(id) ? { ...(data as Listing), available: false } : data as Listing
  },

  async createListing(input: NewListingInput): Promise<Listing> {
    const { data, error } = await supabase
      .from('listings')
      .insert({
        title: input.title,
        property_type: input.property_type,
        location: input.location,
        nightly_rate: input.nightly_rate,
        max_guests: input.max_guests,
        available: input.available,
        image_url: input.image_url ?? null,
        description: input.description ?? null,
      })
      .select('*')
      .single()
    if (error) throw new ApiError(500, error.message)
    await this.logAudit('host', 'CLIENT', 'CREATE_LISTING', String((data as Listing).id), 'SUCCESS', 'Listing created')
    return data as Listing
  },

  async deleteListing(id: string): Promise<void> {
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) throw new ApiError(500, error.message)
    await this.logAudit('host', 'CLIENT', 'DELETE_LISTING', id, 'SUCCESS', 'Listing deleted')
  },

  async updateListingAvailability(id: string, available: boolean): Promise<void> {
    const { error } = await supabase.from('listings').update({ available }).eq('id', id)
    if (error) throw new ApiError(500, error.message)
  },

  markListingTurnover(listingId: string, checkOut: string): void {
    const blockedUntil = new Date(new Date(checkOut).getTime() + TURNOVER_HOURS * 3_600_000).getTime()
    localStorage.setItem(turnoverKey(listingId), String(blockedUntil))
  },

  async getBookings(): Promise<Booking[]> {
    if (!isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from('bookings')
      .select('*, listing:listings(*)')
      .order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    return data as unknown as Booking[]
  },

  async createBooking(input: NewBookingInput): Promise<Booking> {
    await this.assertVerifiedClient(input.client_id)
    const { data: listing, error: lErr } = await supabase
      .from('listings')
      .select('*')
      .eq('id', input.listing_id)
      .maybeSingle()
    if (lErr) throw new ApiError(500, lErr.message)
    if (!listing) throw new ApiError(404, `Listing ${input.listing_id} was not found`)
    const l = listing as Listing
    if (!l.available) throw new ApiError(400, 'Listing is not currently available')
    if (input.guests > l.max_guests) throw new ApiError(400, 'Guest count exceeds listing maxGuests')

    const nights = Math.max(
      1,
      Math.round((new Date(input.check_out).getTime() - new Date(input.check_in).getTime()) / 86_400_000),
    )
    if (nights < 1) throw new ApiError(400, 'checkOut must be after checkIn')
    const totalPrice = Number(l.nightly_rate) * nights

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        listing_id: input.listing_id,
        guest_name: input.guest_name,
        check_in: input.check_in,
        check_out: input.check_out,
        guests: input.guests,
        total_price: totalPrice,
        status: 'CONFIRMED',
      })
      .select('*')
      .single()
    if (error) throw new ApiError(500, error.message)
    const booking = data as Booking
    this.markListingTurnover(input.listing_id, input.check_out)
    await this.logAudit('guest', 'CLIENT', 'CREATE_BOOKING', String(booking.id), 'SUCCESS', 'Booking created')
    return booking
  },

  async getVerification(clientId: string): Promise<ClientVerification | null> {
    if (!isSupabaseConfigured) return null
    const { data, error } = await supabase
      .from('client_verifications')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle()
    if (error) {
      if (error.code === 'PGRST205') return null
      throw new ApiError(500, error.message)
    }
    return data as ClientVerification | null
  },

  async verifyClient(
    adminId: string,
    clientId: string,
    documentType: string,
    documentId: string,
    complianceAccepted: boolean,
  ): Promise<ClientVerification> {
    if (!documentId || documentId.trim().length < 6) {
      throw new ApiError(400, 'documentId must be at least 6 characters')
    }
    if (!complianceAccepted) {
      throw new ApiError(400, 'complianceAccepted must be true')
    }
    const { data, error } = await supabase
      .from('client_verifications')
      .upsert(
        {
          client_id: clientId,
          document_type: documentType,
          document_id: documentId,
          identity_verified: true,
          compliance_accepted: true,
          verified_at: new Date().toISOString(),
        },
        { onConflict: 'client_id' },
      )
      .select('*')
      .single()
    if (error) throw new ApiError(500, error.message)
    await this.logAudit(adminId, 'ADMIN', 'VERIFY_CLIENT', clientId, 'SUCCESS', 'Client identity verified and marked compliant')
    return data as ClientVerification
  },

  async assertVerifiedClient(clientId: string): Promise<ClientVerification> {
    if (!isSupabaseConfigured) throw new ApiError(503, 'Identity verification is unavailable until the Supabase connection is configured.')
    const v = await this.getVerification(clientId)
    if (!v || !v.identity_verified || !v.compliance_accepted) {
      await this.logAudit(clientId, 'CLIENT', 'IDENTITY_CHECK', clientId, 'REJECTED', 'Identity verification and compliance acceptance are required')
      throw new ApiError(400, 'Client identity verification and compliance acceptance are required')
    }
    return v
  },

  async getInstapayPayments(): Promise<InstapayPayment[]> {
    const { data, error } = await supabase
      .from('instapay_payments')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    return data as InstapayPayment[]
  },

  async generateInstapayQr(
    clientId: string,
    bookingId: string,
    merchantAccountId: string,
    merchantName: string,
  ): Promise<{ payment: InstapayPayment; alternatives: FilipinoAlternative[] }> {
    await this.assertVerifiedClient(clientId)

    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle()
    if (bErr) throw new ApiError(500, bErr.message)
    if (!booking) throw new ApiError(404, `Booking ${bookingId} was not found`)
    const b = booking as Booking

    const reference = `IP-${b.id.slice(0, 8).toUpperCase()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
    const amount = Number(b.total_price)
    const sanitize = (s: string) => s.replace(/\|/g, '').trim()
    const qrPayload = `QRPH|INSTAPAY|REF:${reference}|MID:${sanitize(merchantAccountId)}|M:${sanitize(merchantName)}|AMT:${amount.toFixed(2)}|CCY:PHP`

    const { data, error } = await supabase
      .from('instapay_payments')
      .insert({
        booking_id: bookingId,
        payment_reference: reference,
        amount,
        currency: 'PHP',
        qr_payload: qrPayload,
      })
      .select('*')
      .single()
    if (error) throw new ApiError(500, error.message)
    const payment = data as InstapayPayment
    await this.logAudit(clientId, 'CLIENT', 'GENERATE_INSTAPAY_QR', String(b.id), 'SUCCESS', 'Generated InstaPay QR payload')
    return { payment, alternatives: FILIPINO_ALTERNATIVES }
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(200)
    if (error) throw new ApiError(500, error.message)
    return data as AuditLog[]
  },

  async logAudit(
    actorId: string,
    actorType: string,
    action: string,
    targetId: string,
    outcome: string,
    detail: string,
  ): Promise<void> {
    await supabase.from('audit_logs').insert({
      actor_id: actorId,
      actor_type: actorType,
      action,
      target_id: targetId,
      outcome,
      detail,
    })
  },
}
