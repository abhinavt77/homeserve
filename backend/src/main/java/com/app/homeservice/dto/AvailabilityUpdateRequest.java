package com.app.homeservice.dto;

import jakarta.validation.constraints.NotNull;

public class AvailabilityUpdateRequest {

    @NotNull(message = "Online status is required")
    private Boolean isOnline;

    public AvailabilityUpdateRequest() {}

    public AvailabilityUpdateRequest(Boolean isOnline) {
        this.isOnline = isOnline;
    }

    public Boolean getIsOnline() {
        return isOnline;
    }

    public void setIsOnline(Boolean isOnline) {
        this.isOnline = isOnline;
    }
}
