package com.app.homeservice.controller;

import com.app.homeservice.dto.ApiResponse;
import com.app.homeservice.dto.BookingResponse;
import com.app.homeservice.dto.CancelBookingRequest;
import com.app.homeservice.dto.CreateBookingRequest;
import com.app.homeservice.entity.User;
import com.app.homeservice.service.BookingService;
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
@RequestMapping("/customer/bookings")
@PreAuthorize("hasRole('USER')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Customer Bookings", description = "Endpoints for customers to request home services, track status, and cancel bookings")
public class CustomerBookingController {

    private final BookingService bookingService;

    public CustomerBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @Operation(summary = "Create a new service request", description = "Creates a PENDING request and notifies online, verified nearby providers within search radius")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@AuthenticationPrincipal User user,
                                                                      @Valid @RequestBody CreateBookingRequest request) {
        BookingResponse booking = bookingService.createBooking(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service request created successfully", booking));
    }

    @GetMapping
    @Operation(summary = "Get booking history for the current customer")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getCustomerBookings(@AuthenticationPrincipal User user) {
        List<BookingResponse> bookings = bookingService.getCustomerBookings(user.getId());
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking details by ID")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @GetMapping("/track/{trackingNumber}")
    @Operation(summary = "Track service request live by tracking number")
    public ResponseEntity<ApiResponse<BookingResponse>> trackBooking(@PathVariable String trackingNumber) {
        BookingResponse booking = bookingService.getBookingByTrackingNumber(trackingNumber);
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel service request with reason")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(@AuthenticationPrincipal User user,
                                                                      @PathVariable Long id,
                                                                      @Valid @RequestBody CancelBookingRequest request) {
        BookingResponse cancelled = bookingService.cancelBooking(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", cancelled));
    }
}
