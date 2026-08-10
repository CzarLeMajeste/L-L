package com.lodgelink.backend.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;

public record VerifyClientRequest(
    @NotBlank String documentType,
    @NotBlank String documentId,
    @AssertTrue(message = "complianceAccepted must be true") boolean complianceAccepted
) {
}
