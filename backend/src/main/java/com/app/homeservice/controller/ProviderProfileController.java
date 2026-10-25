package com.app.homeservice.controller;

import com.app.homeservice.dto.ApiResponse;
import com.app.homeservice.dto.AvailabilityUpdateRequest;
import com.app.homeservice.dto.LocationUpdateRequest;
import com.app.homeservice.dto.ProviderProfileResponse;
import com.app.homeservice.dto.ProviderProfileUpdateRequest;
import com.app.homeservice.entity.User;
import com.app.homeservice.service.ProviderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/provider/profile")
@PreAuthorize("hasRole('PROVIDER')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Provider Profile", description = "Endpoints for provider profile management, live location, and online/offline status")
public class ProviderProfileController {

    private final ProviderService providerService;

    public ProviderProfileController(ProviderService providerService) {
        this.providerService = providerService;
    }

    @GetMapping
    @Operation(summary = "Get current provider profile")
    public ResponseEntity<ApiResponse<ProviderProfileResponse>> getProfile(@AuthenticationPrincipal User user) {
        ProviderProfileResponse profile = providerService.getProfileByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping
    @Operation(summary = "Update provider profile details")
    public ResponseEntity<ApiResponse<ProviderProfileResponse>> updateProfile(@AuthenticationPrincipal User user,
                                                                              @Valid @RequestBody ProviderProfileUpdateRequest request) {
        ProviderProfileResponse updated = providerService.updateProfile(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PatchMapping("/availability")
    @Operation(summary = "Toggle provider online/offline status")
    public ResponseEntity<ApiResponse<ProviderProfileResponse>> updateAvailability(@AuthenticationPrincipal User user,
                                                                                   @Valid @RequestBody AvailabilityUpdateRequest request) {
        ProviderProfileResponse updated = providerService.updateAvailability(user.getId(), request.getIsOnline());
        String statusText = request.getIsOnline() ? "online" : "offline";
        return ResponseEntity.ok(ApiResponse.success("You are now " + statusText, updated));
    }

    @PatchMapping("/location")
    @Operation(summary = "Update live GPS location coordinates")
    public ResponseEntity<ApiResponse<ProviderProfileResponse>> updateLocation(@AuthenticationPrincipal User user,
                                                                               @Valid @RequestBody LocationUpdateRequest request) {
        ProviderProfileResponse updated = providerService.updateLocation(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Location updated successfully", updated));
    }
}
