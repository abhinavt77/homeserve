package com.app.homeservice.dto;

import com.app.homeservice.entity.RequestStatus;
import com.app.homeservice.entity.ServiceRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingResponse {
    private Long id;
    private String trackingNumber;
    private RequestStatus status;
    private String description;
    private LocalDateTime scheduledAt;
    private BigDecimal estimatedCost;
    private BigDecimal finalCost;
    private String cancellationReason;
    private Double searchRadiusKm;
    private Long version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private UserResponse customer;
    private ProviderProfileResponse provider;
    private CategoryResponse category;
    private AddressResponse address;

    public BookingResponse() {}

    public static BookingResponse fromEntity(ServiceRequest req) {
        return fromEntity(req, null);
    }

    public static BookingResponse fromEntity(ServiceRequest req, ProviderProfileResponse providerProfile) {
        if (req == null) return null;
        BookingResponse resp = new BookingResponse();
        resp.setId(req.getId());
        resp.setTrackingNumber(req.getTrackingNumber());
        resp.setStatus(req.getStatus());
        resp.setDescription(req.getDescription());
        resp.setScheduledAt(req.getScheduledAt());
        resp.setEstimatedCost(req.getEstimatedCost());
        resp.setFinalCost(req.getFinalCost());
        resp.setCancellationReason(req.getCancellationReason());
        resp.setSearchRadiusKm(req.getSearchRadiusKm());
        resp.setVersion(req.getVersion());
        resp.setCreatedAt(req.getCreatedAt());
        resp.setUpdatedAt(req.getUpdatedAt());

        resp.setCustomer(UserResponse.fromEntity(req.getCustomer()));
        resp.setCategory(CategoryResponse.fromEntity(req.getCategory()));
        resp.setAddress(AddressResponse.fromEntity(req.getAddress()));
        resp.setProvider(providerProfile);

        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
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

    public BigDecimal getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(BigDecimal estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public BigDecimal getFinalCost() {
        return finalCost;
    }

    public void setFinalCost(BigDecimal finalCost) {
        this.finalCost = finalCost;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public Double getSearchRadiusKm() {
        return searchRadiusKm;
    }

    public void setSearchRadiusKm(Double searchRadiusKm) {
        this.searchRadiusKm = searchRadiusKm;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public UserResponse getCustomer() {
        return customer;
    }

    public void setCustomer(UserResponse customer) {
        this.customer = customer;
    }

    public ProviderProfileResponse getProvider() {
        return provider;
    }

    public void setProvider(ProviderProfileResponse provider) {
        this.provider = provider;
    }

    public CategoryResponse getCategory() {
        return category;
    }

    public void setCategory(CategoryResponse category) {
        this.category = category;
    }

    public AddressResponse getAddress() {
        return address;
    }

    public void setAddress(AddressResponse address) {
        this.address = address;
    }
}
