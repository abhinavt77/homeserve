package com.app.homeservice.service;

import com.app.homeservice.dto.LocationUpdateRequest;
import com.app.homeservice.dto.ProviderProfileResponse;
import com.app.homeservice.dto.ProviderProfileUpdateRequest;

import java.util.List;

public interface ProviderService {
    ProviderProfileResponse getProfileByUserId(Long userId);
    ProviderProfileResponse getProfileById(Long id);
    ProviderProfileResponse updateProfile(Long userId, ProviderProfileUpdateRequest request);
    ProviderProfileResponse updateAvailability(Long userId, boolean isOnline);
    ProviderProfileResponse updateLocation(Long userId, LocationUpdateRequest request);
    List<ProviderProfileResponse> getNearbyAvailableProviders(Long categoryId, double lat, double lng, double radiusKm);
    List<ProviderProfileResponse> getAllProviders();
    ProviderProfileResponse verifyProvider(Long providerId, boolean isVerified);
}
