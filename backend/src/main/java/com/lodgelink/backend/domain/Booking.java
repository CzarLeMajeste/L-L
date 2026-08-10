package com.lodgelink.backend.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

public record Booking(
    Long id,
    Long listingId,
    String guestName,
    LocalDate checkIn,
    LocalDate checkOut,
    int guests,
    BigDecimal totalPrice,
    BookingStatus status
) {
}
