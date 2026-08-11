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
export const TEST_CLIENT_ID = 'guest-001'
const turnoverKey = (listingId: string) => `lodgelink-turnover-${listingId}`
const localBookingKey = (bookingId: string) => `lodgelink-booking-${bookingId}`
const isInTurnover = (listingId: string) => {
  const blockedUntil = Number(localStorage.getItem(turnoverKey(listingId)))
  return Number.isFinite(blockedUntil) && blockedUntil > Date.now()
}

const EXAMPLE_LISTINGS: Listing[] = [
  {
    id: 'demo-sibalom-campus-house',
    title: 'Campus Gate Boarding House',
    property_type: 'LODGING_HOUSE',
    location: 'Sibalom, Antique · 5 min to University of Antique',
    nightly_rate: 3600,
    monthly_rate: 3600,
    max_guests: 6,
    available: true,
    image_url: 'https://images.pexels.com/photos/36930158/pexels-photo-36930158.jpeg',
    description: 'A quiet shared home near the University of Antique gate with study-friendly common spaces.',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-sibalom-riverside-house',
    title: 'Sibalom Riverside Rooms',
    property_type: 'LODGING_HOUSE',
    location: 'Sibalom, Antique · near Sibalom River',
    nightly_rate: 2900,
    monthly_rate: 2900,
    max_guests: 5,
    available: true,
    image_url: 'https://images.pexels.com/photos/29793237/pexels-photo-29793237.jpeg',
    description: 'Affordable private rooms for students who want a calm place to study close to campus.',
    created_at: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'demo-sibalom-townhouse',
    title: 'Sibalom Townhouse for Boarders',
    property_type: 'LODGING_HOUSE',
    location: 'Sibalom, Antique · near the public market',
    nightly_rate: 3200,
    monthly_rate: 3200,
    max_guests: 4,
    available: true,
    image_url: 'https://images.pexels.com/photos/10085110/pexels-photo-10085110.jpeg',
    description: 'A friendly townhouse with practical rooms, shared kitchen access, and easy rides to campus.',
    created_at: '2025-01-03T00:00:00.000Z',
  },
  {
    id: 'demo-sibalom-study-house',
    title: 'Antique Study House',
    property_type: 'LODGING_HOUSE',
    location: 'Sibalom, Antique · University of Antique area',
    nightly_rate: 2600,
    monthly_rate: 2600,
    max_guests: 3,
    available: true,
    image_url: 'https://images.pexels.com/photos/38186695/pexels-photo-38186695.jpeg',
    description: 'A simple boarder home with quiet hours, reliable water, and a welcoming student community.',
    created_at: '2025-01-04T00:00:00.000Z',
  },
  {
    id: 'demo-sibalom-acacia-house',
    title: 'Acacia Lane Boarders House',
    property_type: 'LODGING_HOUSE',
    location: 'Sibalom, Antique · Acacia Lane',
    nightly_rate: 2500,
    monthly_rate: 2500,
    max_guests: 4,
    available: true,
    image_url: 'https://images.pexels.com/photos/27582015/pexels-photo-27582015.jpeg',
    description: 'A friendly four-room house with a shaded outdoor area and shared study table.',
    created_at: '2025-01-05T00:00:00.000Z',
  },
  {
    id: 'demo-sibalom-palengke-rooms',
    title: 'Palengke Side Rooms',
    property_type: 'LODGING_HOUSE',
    location: 'Sibalom, Antique · near the public market',
    nightly_rate: 2200,
    monthly_rate: 2200,
    max_guests: 3,
    available: true,
    image_url: 'https://images.pexels.com/photos/36930158/pexels-photo-36930158.jpeg',
    description: 'Convenient rooms for boarders who want groceries, food stalls, and transport nearby.',
    created_at: '2025-01-06T00:00:00.000Z',
  },
  {
    id: 'demo-sibalom-green-courtyard',
    title: 'Green Courtyard Boarding House',
    property_type: 'LODGING_HOUSE',
    location: 'Sibalom, Antique · Barangay 3',
    nightly_rate: 3100,
    monthly_rate: 3100,
    max_guests: 5,
    available: true,
    image_url: 'https://images.pexels.com/photos/29793237/pexels-photo-29793237.jpeg',
    description: 'A breezy shared home with a green courtyard and a calm setup for weekday study.',
    created_at: '2025-01-07T00:00:00.000Z',
  },
  {
    id: 'demo-sibalom-mango-house',
    title: 'Mango Tree Boarder Home',
    property_type: 'LODGING_HOUSE',
    location: 'Sibalom, Antique · campus tricycle route',
    nightly_rate: 2700,
    monthly_rate: 2700,
    max_guests: 4,
    available: true,
    image_url: 'https://images.pexels.com/photos/10085110/pexels-photo-10085110.jpeg',
    description: 'A practical home with shared kitchen access and a direct tricycle route to campus.',
    created_at: '2025-01-08T00:00:00.000Z',
  },
  {
    id: 'demo-sibalom-sunrise-rooms',
    title: 'Sunrise Street Rooms',
    property_type: 'LODGING_HOUSE',
    location: 'Sibalom, Antique · east campus area',
    nightly_rate: 2400,
    monthly_rate: 2400,
    max_guests: 3,
    available: true,
    image_url: 'https://images.pexels.com/photos/38186695/pexels-photo-38186695.jpeg',
    description: 'Affordable private rooms with bright mornings and a small community of student boarders.',
    created_at: '2025-01-09T00:00:00.000Z',
  },
  {
    id: 'demo-sibalom-campus-corner',
    title: 'Campus Corner Boarders Home',
    property_type: 'LODGING_HOUSE',
    location: 'Sibalom, Antique · University of Antique west route',
    nightly_rate: 2300,
    monthly_rate: 2300,
    max_guests: 4,
    available: true,
    image_url: 'https://images.pexels.com/photos/27582015/pexels-photo-27582015.jpeg',
    description: 'A simple, social home with a short ride to classes and easy access to student essentials.',
    created_at: '2025-01-10T00:00:00.000Z',
  },
]

const getStudentCommunities = (): Listing[] => JSON.parse(localStorage.getItem('student-communities') ?? '[]')
const displayExamples = EXAMPLE_LISTINGS.map((listing, index) => ({
  ...listing,
  partner_status: index < 2 ? 'VERIFIED_PARTNER' as const : 'UNVERIFIED_STUDENT' as const,
  moderator_enabled: index < 2,
  community_events: index < 2 ? ['Boarder orientation'] : [],
  rooms_available: index % 3 + 1,
  room_capacity: listing.max_guests,
  rental_mode: index % 3 === 0 ? 'BOTH' as const : 'MONTHLY' as const,
}))

export const api = {
  async createStudentCommunity(input: Pick<Listing, 'title' | 'location' | 'description' | 'monthly_rate' | 'max_guests' | 'image_url'>): Promise<Listing> {
    const community: Listing = {
      id: `student-community-${crypto.randomUUID()}`,
      title: input.title,
      property_type: 'LODGING_HOUSE',
      location: input.location,
      nightly_rate: input.monthly_rate ?? 0,
      monthly_rate: input.monthly_rate,
      max_guests: input.max_guests ?? 1,
      available: true,
      image_url: input.image_url ?? null,
      description: input.description ?? null,
      partner_status: 'UNVERIFIED_STUDENT',
      moderator_enabled: false,
      community_events: [],
      created_by: 'student-boarder',
      created_at: new Date().toISOString(),
    }
    localStorage.setItem('student-communities', JSON.stringify([community, ...getStudentCommunities()]))
    return community
  },

  async getListings(propertyType?: PropertyType): Promise<Listing[]> {
    if (!isSupabaseConfigured) {
      const availableExamples = [...getStudentCommunities(), ...displayExamples].filter((listing) => !isInTurnover(listing.id))
      return propertyType ? availableExamples.filter((listing) => listing.property_type === propertyType) : availableExamples
    }
    let query = supabase.from('listings').select('*').order('created_at', { ascending: true })
    if (propertyType) query = query.eq('property_type', propertyType)
    const { data, error } = await query
    if (error) {
      if (error.code === 'PGRST205') {
        const availableExamples = [...getStudentCommunities(), ...displayExamples].filter((listing) => !isInTurnover(listing.id))
        return propertyType ? availableExamples.filter((listing) => listing.property_type === propertyType) : availableExamples
      }
      throw new ApiError(500, error.message)
    }
    const listings = data as Listing[]
    const mergedListings = [...listings, ...getStudentCommunities(), ...displayExamples.filter((example) => !listings.some((listing) => listing.id === example.id))]
    const availableListings = mergedListings.map((listing) => isInTurnover(listing.id) ? { ...listing, available: false } : listing)
    return propertyType ? availableListings.filter((listing) => listing.property_type === propertyType) : availableListings
  },

  async getListing(id: string): Promise<Listing> {
    if (!isSupabaseConfigured) {
      const listing = displayExamples.find((item) => item.id === id)
      if (!listing) throw new ApiError(404, `Listing ${id} was not found`)
      return isInTurnover(id) ? { ...listing, available: false } : listing
    }
    const { data, error } = await supabase.from('listings').select('*').eq('id', id).maybeSingle()
    if (error) {
      if (error.code === 'PGRST205') {
        const example = displayExamples.find((listing) => listing.id === id)
        if (example) return example
      }
      throw new ApiError(500, error.message)
    }
    if (!data) {
      const example = displayExamples.find((listing) => listing.id === id)
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
        client_id: input.client_id,
        guest_name: input.guest_name,
        check_in: input.check_in,
        check_out: input.check_out,
        guests: input.guests,
        total_price: totalPrice,
        status: 'CONFIRMED',
      })
      .select('*')
      .single()
    if (error && !(import.meta.env.DEV && error.code === '42501' && input.client_id === TEST_CLIENT_ID)) {
      if (error.code === '42501') throw new ApiError(403, 'Bookings are blocked by Supabase Row Level Security. Add the anonymous booking insert policy before using real client IDs.')
      throw new ApiError(500, error.message)
    }
    const booking = (data as Booking | null) ?? {
      id: `test-booking-${Date.now()}`,
      listing_id: input.listing_id,
      guest_name: input.guest_name,
      check_in: input.check_in,
      check_out: input.check_out,
      guests: input.guests,
      total_price: totalPrice,
      status: 'CONFIRMED',
      created_at: new Date().toISOString(),
    }
    this.markListingTurnover(input.listing_id, input.check_out)
    if (import.meta.env.DEV && booking.id.startsWith('test-booking-')) localStorage.setItem(localBookingKey(booking.id), JSON.stringify(booking))
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
    if (import.meta.env.DEV && clientId === TEST_CLIENT_ID) {
      return {
        id: 'test-verification-001',
        client_id: TEST_CLIENT_ID,
        document_type: 'TEST_ID',
        document_id: TEST_CLIENT_ID,
        identity_verified: true,
        compliance_accepted: true,
        verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
    }
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

    if (import.meta.env.DEV && bookingId.startsWith('test-booking-')) {
      const booking = JSON.parse(localStorage.getItem(localBookingKey(bookingId)) ?? 'null') as Booking | null
      if (!booking) throw new ApiError(404, `Booking ${bookingId} was not found`)
      const reference = `IP-${booking.id.slice(-8).toUpperCase()}`
      const amount = Number(booking.total_price)
      const qrPayload = `QRPH|INSTAPAY|REF:${reference}|MID:${merchantAccountId}|M:${merchantName}|AMT:${amount.toFixed(2)}|CCY:PHP`
      return {
        payment: { id: `test-payment-${Date.now()}`, booking_id: booking.id, payment_reference: reference, amount, currency: 'PHP', qr_payload: qrPayload, created_at: new Date().toISOString() },
        alternatives: FILIPINO_ALTERNATIVES,
      }
    }

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
