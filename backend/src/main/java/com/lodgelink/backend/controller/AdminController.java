package com.lodgelink.backend.controller;

import com.lodgelink.backend.domain.AuditLogEntry;
import com.lodgelink.backend.domain.ClientVerificationStatus;
import com.lodgelink.backend.dto.VerifyClientRequest;
import com.lodgelink.backend.service.AuditLogService;
import com.lodgelink.backend.service.IdentityVerificationService;
import com.lodgelink.backend.service.InvalidRequestException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final IdentityVerificationService identityVerificationService;
    private final AuditLogService auditLogService;

    public AdminController(
        IdentityVerificationService identityVerificationService,
        AuditLogService auditLogService
    ) {
        this.identityVerificationService = identityVerificationService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/clients/{clientId}/verify")
    @ResponseStatus(HttpStatus.OK)
    public ClientVerificationStatus verifyClient(
        @RequestHeader("X-Admin-Id") String adminId,
        @PathVariable String clientId,
        @Valid @RequestBody VerifyClientRequest request
    ) {
        requireAdminHeader(adminId);
        return identityVerificationService.verifyClient(adminId, clientId, request);
    }

    @GetMapping("/audit-logs")
    public List<AuditLogEntry> getAuditLogs(@RequestHeader("X-Admin-Id") String adminId) {
        requireAdminHeader(adminId);
        auditLogService.log(
            adminId,
            "ADMIN",
            "VIEW_AUDIT_LOGS",
            "AUDIT_LOG",
            "SUCCESS",
            "Admin viewed audit logs"
        );
        return auditLogService.getEntries();
    }

    private void requireAdminHeader(String adminId) {
        if (adminId == null || adminId.isBlank()) {
            throw new InvalidRequestException("X-Admin-Id header is required for admin controls");
        }
    }
}
