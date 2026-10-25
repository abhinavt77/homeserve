package com.app.homeservice.dto;

import com.app.homeservice.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class UpdateJobStatusRequest {

    @NotNull(message = "New status is required")
    private RequestStatus status;

    private BigDecimal finalCost;

    public UpdateJobStatusRequest() {}

    public UpdateJobStatusRequest(RequestStatus status, BigDecimal finalCost) {
        this.status = status;
        this.finalCost = finalCost;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public BigDecimal getFinalCost() {
        return finalCost;
    }

    public void setFinalCost(BigDecimal finalCost) {
        this.finalCost = finalCost;
    }
}
