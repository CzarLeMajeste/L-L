package com.lodgelink.backend.dto;

import com.lodgelink.backend.domain.PropertyType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateListingRequest(
    @NotBlank String title,
    @NotNull PropertyType propertyType,
    @NotBlank String location,
    @NotNull @DecimalMin(value = "0.01") BigDecimal nightlyRate,
    @Min(1) int maxGuests,
    boolean available
) {
}
