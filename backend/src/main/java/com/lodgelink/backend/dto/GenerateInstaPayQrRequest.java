package com.lodgelink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GenerateInstaPayQrRequest(
    @NotNull Long bookingId,
    @NotBlank String merchantAccountId,
    @NotBlank String merchantName
) {
}
