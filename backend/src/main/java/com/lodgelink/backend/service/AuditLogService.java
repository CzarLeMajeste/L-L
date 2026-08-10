package com.lodgelink.backend.service;

import com.lodgelink.backend.domain.AuditLogEntry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class AuditLogService {
    private static final Logger LOGGER = LoggerFactory.getLogger(AuditLogService.class);
    private final List<AuditLogEntry> entries = new CopyOnWriteArrayList<>();

    public void log(String actorId, String actorType, String action, String targetId, String outcome, String detail) {
        AuditLogEntry entry = new AuditLogEntry(
            Instant.now(),
            actorId,
            actorType,
            action,
            targetId,
            outcome,
            detail
        );
        entries.add(entry);

        LOGGER.info(
            "audit actorType={} actorId={} action={} targetId={} outcome={} detail={}",
            actorType,
            actorId,
            action,
            targetId,
            outcome,
            detail
        );
    }

    public List<AuditLogEntry> getEntries() {
        List<AuditLogEntry> sortedEntries = new ArrayList<>(entries);
        sortedEntries.sort(Comparator.comparing(AuditLogEntry::timestamp));
        return sortedEntries;
    }
}
