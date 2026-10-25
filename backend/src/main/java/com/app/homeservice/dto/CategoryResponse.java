package com.app.homeservice.dto;

import com.app.homeservice.entity.ServiceCategory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CategoryResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private BigDecimal basePrice;
    private String iconUrl;
    private boolean active;
    private LocalDateTime createdAt;

    public CategoryResponse() {}

    public CategoryResponse(Long id, String name, String code, String description, BigDecimal basePrice, String iconUrl, boolean active, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.basePrice = basePrice;
        this.iconUrl = iconUrl;
        this.active = active;
        this.createdAt = createdAt;
    }

    public static CategoryResponse fromEntity(ServiceCategory category) {
        if (category == null) return null;
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getCode(),
                category.getDescription(),
                category.getBasePrice(),
                category.getIconUrl(),
                category.isActive(),
                category.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public String getIconUrl() {
        return iconUrl;
    }

    public void setIconUrl(String iconUrl) {
        this.iconUrl = iconUrl;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
