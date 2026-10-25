package com.app.homeservice.controller;

import com.app.homeservice.dto.ApiResponse;
import com.app.homeservice.dto.CreateOrderResponse;
import com.app.homeservice.dto.PaymentResponse;
import com.app.homeservice.dto.PaymentVerificationRequest;
import com.app.homeservice.entity.User;
import com.app.homeservice.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customer/payments")
@PreAuthorize("hasRole('USER')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Payments", description = "Endpoints for Razorpay online checkout and cash settlement")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order/{bookingId}")
    @Operation(summary = "Initialize Razorpay order for completed service")
    public ResponseEntity<ApiResponse<CreateOrderResponse>> createOrder(@AuthenticationPrincipal User user,
                                                                        @PathVariable Long bookingId) {
        CreateOrderResponse order = paymentService.createRazorpayOrder(bookingId, user.getId());
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/verify/{bookingId}")
    @Operation(summary = "Verify Razorpay payment signature after client checkout")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(@AuthenticationPrincipal User user,
                                                                      @PathVariable Long bookingId,
                                                                      @Valid @RequestBody PaymentVerificationRequest request) {
        PaymentResponse response = paymentService.verifyRazorpayPayment(bookingId, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", response));
    }

    @PostMapping("/cash/{bookingId}")
    @Operation(summary = "Settle service with cash payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> payWithCash(@AuthenticationPrincipal User user,
                                                                    @PathVariable Long bookingId) {
        PaymentResponse response = paymentService.payWithCash(bookingId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Payment marked as Cash Received", response));
    }

    @GetMapping("/{bookingId}")
    @Operation(summary = "Get payment receipt details for a booking")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(@AuthenticationPrincipal User user,
                                                                   @PathVariable Long bookingId) {
        PaymentResponse payment = paymentService.getPaymentByBookingId(bookingId, user.getId());
        return ResponseEntity.ok(ApiResponse.success(payment));
    }
}
