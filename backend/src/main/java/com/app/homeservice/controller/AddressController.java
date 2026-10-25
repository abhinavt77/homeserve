package com.app.homeservice.controller;

import com.app.homeservice.dto.AddressRequest;
import com.app.homeservice.dto.AddressResponse;
import com.app.homeservice.dto.ApiResponse;
import com.app.homeservice.entity.User;
import com.app.homeservice.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customer/addresses")
@PreAuthorize("hasRole('USER')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Customer Addresses", description = "Endpoints for managing multiple customer delivery and service addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    @Operation(summary = "Get all saved addresses for logged-in customer")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses(@AuthenticationPrincipal User user) {
        List<AddressResponse> addresses = addressService.getUserAddresses(user.getId());
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @PostMapping
    @Operation(summary = "Add a new address (with map coordinates)")
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(@AuthenticationPrincipal User user,
                                                                      @Valid @RequestBody AddressRequest request) {
        AddressResponse created = addressService.createAddress(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address added successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing address")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(@AuthenticationPrincipal User user,
                                                                      @PathVariable Long id,
                                                                      @Valid @RequestBody AddressRequest request) {
        AddressResponse updated = addressService.updateAddress(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an address")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@AuthenticationPrincipal User user,
                                                           @PathVariable Long id) {
        addressService.deleteAddress(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }

    @PatchMapping("/{id}/default")
    @Operation(summary = "Mark address as primary default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefaultAddress(@AuthenticationPrincipal User user,
                                                                          @PathVariable Long id) {
        AddressResponse updated = addressService.setDefaultAddress(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Default address updated", updated));
    }
}
