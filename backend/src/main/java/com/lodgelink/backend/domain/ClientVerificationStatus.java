package com.lodgelink.backend.domain;

import java.time.Instant;

public record ClientVerificationStatus(
    String clientId,
    boolean identityVerified,
    boolean complianceAccepted,
    String verificationType,
    Instant verifiedAt
) {
}
