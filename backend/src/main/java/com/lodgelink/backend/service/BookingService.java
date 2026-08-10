package com.lodgelink.backend.service;

import com.lodgelink.backend.domain.Booking;
import com.lodgelink.backend.domain.BookingStatus;
import com.lodgelink.backend.domain.Listing;
import com.lodgelink.backend.dto.CreateBookingRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class BookingService {
    private final Map<Long, Booking> bookings = new ConcurrentHashMap<>();
    private final AtomicLong bookingIdSequence = new AtomicLong(1);
    private final ListingService listingService;
    private final IdentityVerificationService identityVerificationService;
    private final AuditLogService auditLogService;

    public BookingService(
        ListingService listingService,
        IdentityVerificationService identityVerificationService,
        AuditLogService auditLogService
    ) {
        this.listingService = listingService;
        this.identityVerificationService = identityVerificationService;
        this.auditLogService = auditLogService;
    }

    public Booking createBooking(String clientId, CreateBookingRequest request) {
        identityVerificationService.assertVerifiedClient(clientId);

        if (!request.checkOut().isAfter(request.checkIn())) {
            throw new InvalidRequestException("checkOut must be after checkIn");
        }

        Listing listing = listingService.getListing(request.listingId());
        if (!listing.available()) {
            throw new InvalidRequestException("Listing is not currently available");
        }
        if (request.guests() > listing.maxGuests()) {
            throw new InvalidRequestException("Guest count exceeds listing maxGuests");
        }

        long nights = ChronoUnit.DAYS.between(request.checkIn(), request.checkOut());
        BigDecimal totalPrice = listing.nightlyRate().multiply(BigDecimal.valueOf(nights));

        long id = bookingIdSequence.getAndIncrement();
        Booking booking = new Booking(
            id,
            listing.id(),
            request.guestName(),
            request.checkIn(),
            request.checkOut(),
            request.guests(),
            totalPrice,
            BookingStatus.CONFIRMED
        );
        bookings.put(id, booking);
        auditLogService.log(clientId, "CLIENT", "CREATE_BOOKING", String.valueOf(id), "SUCCESS", "Booking created");
        return booking;
    }

    public List<Booking> getBookings() {
        return bookings.values().stream()
            .sorted(Comparator.comparing(Booking::id))
            .toList();
    }

    public Booking getBooking(Long bookingId) {
        Booking booking = bookings.get(bookingId);
        if (booking == null) {
            throw new ResourceNotFoundException("Booking " + bookingId + " was not found");
        }
        return booking;
    }
}
