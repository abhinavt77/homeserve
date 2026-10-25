package com.app.homeservice.dto;

import com.app.homeservice.entity.ProviderProfile;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProviderProfileResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String profileImageUrl;
    private Long categoryId;
    private String categoryName;
    private String categoryCode;
    private Integer experienceYears;
    private BigDecimal hourlyRate;
    private String bio;
    private String documentUrl;
    private Double latitude;
    private Double longitude;
    private boolean isOnline;
    private boolean isVerified;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private LocalDateTime createdAt;

    public ProviderProfileResponse() {}

    public static ProviderProfileResponse fromEntity(ProviderProfile p) {
        if (p == null) return null;
        ProviderProfileResponse resp = new ProviderProfileResponse();
        resp.setId(p.getId());
        if (p.getUser() != null) {
            resp.setUserId(p.getUser().getId());
            resp.setFullName(p.getUser().getFullName());
            resp.setEmail(p.getUser().getEmail());
            resp.setPhone(p.getUser().getPhone());
            resp.setProfileImageUrl(p.getUser().getProfileImageUrl());
        }
        if (p.getServiceCategory() != null) {
            resp.setCategoryId(p.getServiceCategory().getId());
            resp.setCategoryName(p.getServiceCategory().getName());
            resp.setCategoryCode(p.getServiceCategory().getCode());
        }
        resp.setExperienceYears(p.getExperienceYears());
        resp.setHourlyRate(p.getHourlyRate());
        resp.setBio(p.getBio());
        resp.setDocumentUrl(p.getDocumentUrl());
        resp.setLatitude(p.getLatitude());
        resp.setLongitude(p.getLongitude());
        resp.setOnline(p.isOnline());
        resp.setVerified(p.isVerified());
        resp.setAverageRating(p.getAverageRating());
        resp.setTotalReviews(p.getTotalReviews());
        resp.setCreatedAt(p.getCreatedAt());
        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryCode() {
        return categoryCode;
    }

    public void setCategoryCode(String categoryCode) {
        this.categoryCode = categoryCode;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public boolean isOnline() {
        return isOnline;
    }

    public void setOnline(boolean online) {
        isOnline = online;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean verified) {
        isVerified = verified;
    }

    public BigDecimal getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(BigDecimal averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Integer totalReviews) {
        this.totalReviews = totalReviews;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
