package com.app.homeservice.dto;

import jakarta.validation.constraints.NotBlank;

public class CancelBookingRequest {

    @NotBlank(message = "Cancellation reason is required")
    private String reason;

    public CancelBookingRequest() {}

    public CancelBookingRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
