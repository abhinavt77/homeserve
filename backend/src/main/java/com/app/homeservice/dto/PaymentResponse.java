package com.app.homeservice.dto;

import com.app.homeservice.entity.Payment;
import com.app.homeservice.entity.PaymentMethod;
import com.app.homeservice.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private String trackingNumber;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;

    public PaymentResponse() {}

    public static PaymentResponse fromEntity(Payment p) {
        if (p == null) return null;
        PaymentResponse resp = new PaymentResponse();
        resp.setId(p.getId());
        if (p.getServiceRequest() != null) {
            resp.setBookingId(p.getServiceRequest().getId());
            resp.setTrackingNumber(p.getServiceRequest().getTrackingNumber());
        }
        resp.setAmount(p.getAmount());
        resp.setPaymentMethod(p.getPaymentMethod());
        resp.setPaymentStatus(p.getPaymentStatus());
        resp.setRazorpayOrderId(p.getRazorpayOrderId());
        resp.setRazorpayPaymentId(p.getRazorpayPaymentId());
        resp.setPaidAt(p.getPaidAt());
        resp.setCreatedAt(p.getCreatedAt());
        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
