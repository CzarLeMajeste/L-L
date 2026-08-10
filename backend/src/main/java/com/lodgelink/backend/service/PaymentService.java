package com.lodgelink.backend.service;

import com.lodgelink.backend.domain.Booking;
import com.lodgelink.backend.domain.FilipinoPaymentAlternative;
import com.lodgelink.backend.domain.InstaPayQrPayment;
import com.lodgelink.backend.dto.GenerateInstaPayQrRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class PaymentService {
    private static final List<FilipinoPaymentAlternative> FILIPINO_ALTERNATIVES = List.of(
        new FilipinoPaymentAlternative("GCASH", "GCash", "E-wallet cash-in or QR payment"),
        new FilipinoPaymentAlternative("MAYA", "Maya", "Wallet or card-linked digital payments"),
        new FilipinoPaymentAlternative("PESONET", "PESONet", "Batch bank transfer for larger amounts"),
        new FilipinoPaymentAlternative("OTC_BAYAD_CENTER", "Bayad Center", "Over-the-counter cash payment option")
    );

    private final BookingService bookingService;
    private final IdentityVerificationService identityVerificationService;
    private final AuditLogService auditLogService;

    public PaymentService(
        BookingService bookingService,
        IdentityVerificationService identityVerificationService,
        AuditLogService auditLogService
    ) {
        this.bookingService = bookingService;
        this.identityVerificationService = identityVerificationService;
        this.auditLogService = auditLogService;
    }

    public InstaPayQrPayment generateInstaPayQr(String clientId, GenerateInstaPayQrRequest request) {
        identityVerificationService.assertVerifiedClient(clientId);

        Booking booking = bookingService.getBooking(request.bookingId());
        String reference = createReference(booking.id());
        BigDecimal amount = booking.totalPrice();

        String qrPayload = String.format(
            Locale.ROOT,
            "QRPH|INSTAPAY|REF:%s|MID:%s|M:%s|AMT:%s|CCY:PHP",
            reference,
            sanitize(request.merchantAccountId()),
            sanitize(request.merchantName()),
            amount.stripTrailingZeros().toPlainString()
        );

        auditLogService.log(
            clientId,
            "CLIENT",
            "GENERATE_INSTAPAY_QR",
            String.valueOf(booking.id()),
            "SUCCESS",
            "Generated InstaPay QR payload"
        );

        return new InstaPayQrPayment(
            reference,
            booking.id(),
            amount,
            "PHP",
            qrPayload,
            FILIPINO_ALTERNATIVES
        );
    }

    private String sanitize(String value) {
        return value.replace("|", "").trim();
    }

    private String createReference(Long bookingId) {
        String token = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase(Locale.ROOT);
        return "IP-" + bookingId + "-" + token;
    }
}
