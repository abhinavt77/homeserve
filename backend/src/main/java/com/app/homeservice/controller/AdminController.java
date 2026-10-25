package com.app.homeservice.controller;

import com.app.homeservice.dto.AdminDashboardStatsResponse;
import com.app.homeservice.dto.ApiResponse;
import com.app.homeservice.dto.BookingResponse;
import com.app.homeservice.dto.PaymentResponse;
import com.app.homeservice.dto.ProviderProfileResponse;
import com.app.homeservice.dto.UserResponse;
import com.app.homeservice.entity.RequestStatus;
import com.app.homeservice.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Management", description = "Endpoints for platform administration, verifications, dashboard analytics, and user oversight")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get platform-wide dashboard analytics, revenue, and KPIs")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getDashboardStats() {
        AdminDashboardStatsResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved", stats));
    }

    @GetMapping("/providers")
    @Operation(summary = "Get all registered provider profiles with optional verification status filter")
    public ResponseEntity<ApiResponse<List<ProviderProfileResponse>>> getAllProviders(
            @RequestParam(required = false) Boolean verified) {
        List<ProviderProfileResponse> list = adminService.getAllProviders(verified);
        return ResponseEntity.ok(ApiResponse.success("Providers retrieved", list));
    }

    @PatchMapping("/providers/{id}/verify")
    @Operation(summary = "Approve or reject a provider's background verification")
    public ResponseEntity<ApiResponse<ProviderProfileResponse>> updateProviderVerification(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean approved) {
        ProviderProfileResponse response = adminService.updateProviderVerification(id, approved);
        String msg = approved ? "Provider verified successfully" : "Provider verification revoked";
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }

    @GetMapping("/users")
    @Operation(summary = "Get all registered accounts across all roles")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> list = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", list));
    }

    @PatchMapping("/users/{id}/toggle-active")
    @Operation(summary = "Enable or disable a user account")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled) {
        UserResponse response = adminService.toggleUserStatus(id, enabled);
        return ResponseEntity.ok(ApiResponse.success("User status updated", response));
    }

    @GetMapping("/bookings")
    @Operation(summary = "Get all service bookings with optional status filter")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings(
            @RequestParam(required = false) RequestStatus status) {
        List<BookingResponse> list = adminService.getAllBookings(status);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved", list));
    }

    @GetMapping("/payments")
    @Operation(summary = "Get all payment transactions across the platform")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        List<PaymentResponse> list = adminService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved", list));
    }
}
