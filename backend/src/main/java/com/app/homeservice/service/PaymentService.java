package com.app.homeservice.service;

import com.app.homeservice.dto.CreateOrderResponse;
import com.app.homeservice.dto.PaymentResponse;
import com.app.homeservice.dto.PaymentVerificationRequest;

public interface PaymentService {
    CreateOrderResponse createRazorpayOrder(Long bookingId, Long customerId);
    PaymentResponse verifyRazorpayPayment(Long bookingId, Long customerId, PaymentVerificationRequest request);
    PaymentResponse payWithCash(Long bookingId, Long customerId);
    PaymentResponse getPaymentByBookingId(Long bookingId, Long customerId);
}
