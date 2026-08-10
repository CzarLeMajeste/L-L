package com.lodgelink.backend.domain;

import java.time.Instant;

public record AuditLogEntry(
    Instant timestamp,
    String actorId,
    String actorType,
    String action,
    String targetId,
    String outcome,
    String detail
) {
}
