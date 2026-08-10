package com.lodgelink.backend.domain;

import java.math.BigDecimal;
import java.util.List;

public record InstaPayQrPayment(
    String paymentReference,
    Long bookingId,
    BigDecimal amount,
    String currency,
    String qrPayload,
    List<FilipinoPaymentAlternative> filipinoAlternatives
) {
}
