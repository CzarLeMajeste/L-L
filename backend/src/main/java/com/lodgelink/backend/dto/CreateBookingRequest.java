package com.lodgelink.backend.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateBookingRequest(
    @NotNull Long listingId,
    @NotBlank String guestName,
    @NotNull @FutureOrPresent LocalDate checkIn,
    @NotNull LocalDate checkOut,
    @Min(1) int guests
) {
}
