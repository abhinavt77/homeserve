package com.app.homeservice.dto;

import com.app.homeservice.entity.Review;
import java.time.LocalDateTime;

public class ReviewResponse {

    private Long id;
    private Long requestId;
    private String requestTrackingNumber;
    private Long customerId;
    private String customerName;
    private Long providerId;
    private String providerName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public ReviewResponse() {}

    public static ReviewResponse fromEntity(Review review) {
        ReviewResponse res = new ReviewResponse();
        res.setId(review.getId());
        res.setRequestId(review.getRequest().getId());
        res.setRequestTrackingNumber(review.getRequest().getTrackingNumber());
        res.setCustomerId(review.getCustomer().getId());
        res.setCustomerName(review.getCustomer().getFullName());
        res.setProviderId(review.getProvider().getId());
        res.setProviderName(review.getProvider().getFullName());
        res.setRating(review.getRating());
        res.setComment(review.getComment());
        res.setCreatedAt(review.getCreatedAt());
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public String getRequestTrackingNumber() {
        return requestTrackingNumber;
    }

    public void setRequestTrackingNumber(String requestTrackingNumber) {
        this.requestTrackingNumber = requestTrackingNumber;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Long getProviderId() {
        return providerId;
    }

    public void setProviderId(Long providerId) {
        this.providerId = providerId;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
