package com.app.homeservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class CreateBookingRequest {

    @NotNull(message = "Service category is required")
    private Long categoryId;

    @NotNull(message = "Service address is required")
    private Long addressId;

    @NotBlank(message = "Please describe the problem or service requested")
    private String description;

    // Optional: if null, booking is for right now ("Book Now")
    private LocalDateTime scheduledAt;

    public CreateBookingRequest() {}

    public CreateBookingRequest(Long categoryId, Long addressId, String description, LocalDateTime scheduledAt) {
        this.categoryId = categoryId;
        this.addressId = addressId;
        this.description = description;
        this.scheduledAt = scheduledAt;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getAddressId() {
        return addressId;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }
}
