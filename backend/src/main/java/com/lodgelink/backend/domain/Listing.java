package com.lodgelink.backend.domain;

import java.math.BigDecimal;

public record Listing(
    Long id,
    String title,
    PropertyType propertyType,
    String location,
    BigDecimal nightlyRate,
    int maxGuests,
    boolean available
) {
}
