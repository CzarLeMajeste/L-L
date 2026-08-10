package com.lodgelink.backend.service;

import com.lodgelink.backend.domain.ClientVerificationStatus;
import com.lodgelink.backend.dto.VerifyClientRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IdentityVerificationService {
    private final Map<String, ClientVerificationStatus> verificationStatuses = new ConcurrentHashMap<>();
    private final AuditLogService auditLogService;

    public IdentityVerificationService(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    public ClientVerificationStatus verifyClient(String adminId, String clientId, VerifyClientRequest request) {
        if (request.documentId().trim().length() < 6) {
            throw new InvalidRequestException("documentId must be at least 6 characters");
        }

        ClientVerificationStatus status = new ClientVerificationStatus(
            clientId,
            true,
            request.complianceAccepted(),
            request.documentType(),
            Instant.now()
        );
        verificationStatuses.put(clientId, status);
        auditLogService.log(
            adminId,
            "ADMIN",
            "VERIFY_CLIENT",
            clientId,
            "SUCCESS",
            "Client identity verified and marked compliant"
        );
        return status;
    }

    public void assertVerifiedClient(String clientId) {
        if (clientId == null || clientId.isBlank()) {
            throw new InvalidRequestException("X-Client-Id header is required");
        }

        ClientVerificationStatus status = verificationStatuses.get(clientId);
        if (status == null || !status.identityVerified() || !status.complianceAccepted()) {
            auditLogService.log(
                clientId,
                "CLIENT",
                "IDENTITY_CHECK",
                clientId,
                "REJECTED",
                "Identity verification and compliance acceptance are required"
            );
            throw new InvalidRequestException("Client identity verification and compliance acceptance are required");
        }
    }
}
