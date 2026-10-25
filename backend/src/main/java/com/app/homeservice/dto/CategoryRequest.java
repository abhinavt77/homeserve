package com.app.homeservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    @NotBlank(message = "Category code is required")
    private String code;

    private String description;

    @NotNull(message = "Base price is required")
    @PositiveOrZero(message = "Base price cannot be negative")
    private BigDecimal basePrice;

    private String iconUrl;

    private boolean active = true;

    public CategoryRequest() {}

    public CategoryRequest(String name, String code, String description, BigDecimal basePrice, String iconUrl, boolean active) {
        this.name = name;
        this.code = code;
        this.description = description;
        this.basePrice = basePrice;
        this.iconUrl = iconUrl;
        this.active = active;
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
}
