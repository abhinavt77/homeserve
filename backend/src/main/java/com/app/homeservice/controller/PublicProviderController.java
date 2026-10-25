package com.app.homeservice.controller;

import com.app.homeservice.dto.ApiResponse;
import com.app.homeservice.dto.ProviderProfileResponse;
import com.app.homeservice.service.ProviderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/providers")
@Tag(name = "Public Providers", description = "Public endpoints to view provider details and ratings")
public class PublicProviderController {

    private final ProviderService providerService;

    public PublicProviderController(ProviderService providerService) {
        this.providerService = providerService;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get public provider details and ratings by profile ID")
    public ResponseEntity<ApiResponse<ProviderProfileResponse>> getProviderById(@PathVariable Long id) {
        ProviderProfileResponse provider = providerService.getProfileById(id);
        return ResponseEntity.ok(ApiResponse.success(provider));
    }
}
