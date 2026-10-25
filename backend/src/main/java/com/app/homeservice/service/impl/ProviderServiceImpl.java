package com.app.homeservice.service.impl;

import com.app.homeservice.dto.LocationUpdateRequest;
import com.app.homeservice.dto.ProviderProfileResponse;
import com.app.homeservice.dto.ProviderProfileUpdateRequest;
import com.app.homeservice.entity.ProviderProfile;
import com.app.homeservice.entity.ServiceCategory;
import com.app.homeservice.exception.BadRequestException;
import com.app.homeservice.exception.ResourceNotFoundException;
import com.app.homeservice.repository.ProviderProfileRepository;
import com.app.homeservice.repository.ServiceCategoryRepository;
import com.app.homeservice.service.ProviderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProviderServiceImpl implements ProviderService {

    private final ProviderProfileRepository providerProfileRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;

    public ProviderServiceImpl(ProviderProfileRepository providerProfileRepository,
                               ServiceCategoryRepository serviceCategoryRepository) {
        this.providerProfileRepository = providerProfileRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ProviderProfileResponse getProfileByUserId(Long userId) {
        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for user ID: " + userId));
        return ProviderProfileResponse.fromEntity(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public ProviderProfileResponse getProfileById(Long id) {
        ProviderProfile profile = providerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found with ID: " + id));
        return ProviderProfileResponse.fromEntity(profile);
    }

    @Override
    @Transactional
    public ProviderProfileResponse updateProfile(Long userId, ProviderProfileUpdateRequest request) {
        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for user ID: " + userId));

        if (request.getServiceCategoryId() != null) {
            ServiceCategory category = serviceCategoryRepository.findById(request.getServiceCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service category not found: " + request.getServiceCategoryId()));
            profile.setServiceCategory(category);
        }

        if (request.getExperienceYears() != null) profile.setExperienceYears(request.getExperienceYears());
        if (request.getHourlyRate() != null) profile.setHourlyRate(request.getHourlyRate());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getDocumentUrl() != null) profile.setDocumentUrl(request.getDocumentUrl());
        if (request.getLatitude() != null) profile.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) profile.setLongitude(request.getLongitude());

        ProviderProfile saved = providerProfileRepository.save(profile);
        return ProviderProfileResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public ProviderProfileResponse updateAvailability(Long userId, boolean isOnline) {
        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for user ID: " + userId));

        if (isOnline && !profile.isVerified()) {
            throw new BadRequestException("Account must be verified by an administrator before toggling online status.");
        }

        profile.setOnline(isOnline);
        ProviderProfile saved = providerProfileRepository.save(profile);
        return ProviderProfileResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public ProviderProfileResponse updateLocation(Long userId, LocationUpdateRequest request) {
        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for user ID: " + userId));

        profile.setLatitude(request.getLatitude());
        profile.setLongitude(request.getLongitude());
        ProviderProfile saved = providerProfileRepository.save(profile);
        return ProviderProfileResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProviderProfileResponse> getNearbyAvailableProviders(Long categoryId, double lat, double lng, double radiusKm) {
        return providerProfileRepository.findNearbyAvailableProviders(categoryId, lat, lng, radiusKm).stream()
                .map(ProviderProfileResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProviderProfileResponse> getAllProviders() {
        return providerProfileRepository.findAll().stream()
                .map(ProviderProfileResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProviderProfileResponse verifyProvider(Long providerId, boolean isVerified) {
        ProviderProfile profile = providerProfileRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found with ID: " + providerId));

        profile.setVerified(isVerified);
        if (!isVerified) {
            profile.setOnline(false);
        }
        ProviderProfile saved = providerProfileRepository.save(profile);
        return ProviderProfileResponse.fromEntity(saved);
    }
}
