package com.lodgelink.backend.controller;

import com.lodgelink.backend.domain.InstaPayQrPayment;
import com.lodgelink.backend.dto.GenerateInstaPayQrRequest;
import com.lodgelink.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/instapay/qr")
    @ResponseStatus(HttpStatus.CREATED)
    public InstaPayQrPayment generateInstaPayQr(
        @RequestHeader("X-Client-Id") String clientId,
        @Valid @RequestBody GenerateInstaPayQrRequest request
    ) {
        return paymentService.generateInstaPayQr(clientId, request);
    }
}
