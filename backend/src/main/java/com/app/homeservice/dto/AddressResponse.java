package com.app.homeservice.dto;

import com.app.homeservice.entity.Address;

import java.time.LocalDateTime;

public class AddressResponse {
    private Long id;
    private String title;
    private String street;
    private String city;
    private String state;
    private String postalCode;
    private Double latitude;
    private Double longitude;
    private boolean isDefault;
    private LocalDateTime createdAt;

    public AddressResponse() {}

    public AddressResponse(Long id, String title, String street, String city, String state, String postalCode, Double latitude, Double longitude, boolean isDefault, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.street = street;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isDefault = isDefault;
        this.createdAt = createdAt;
    }

    public static AddressResponse fromEntity(Address address) {
        if (address == null) return null;
        return new AddressResponse(
                address.getId(),
                address.getTitle(),
                address.getStreet(),
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getLatitude(),
                address.getLongitude(),
                address.isDefault(),
                address.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
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

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
