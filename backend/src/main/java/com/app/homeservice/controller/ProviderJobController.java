package com.app.homeservice.controller;

import com.app.homeservice.dto.ApiResponse;
import com.app.homeservice.dto.BookingResponse;
import com.app.homeservice.dto.CancelBookingRequest;
import com.app.homeservice.dto.UpdateJobStatusRequest;
import com.app.homeservice.entity.User;
import com.app.homeservice.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/provider/jobs")
@PreAuthorize("hasRole('PROVIDER')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Provider Jobs", description = "Endpoints for providers to view nearby available jobs, accept with optimistic locking, and transition job status")
public class ProviderJobController {

    private final BookingService bookingService;

    public ProviderJobController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/available")
    @Operation(summary = "Get nearby pending jobs matching provider category and location radius")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAvailableJobs(@AuthenticationPrincipal User user) {
        List<BookingResponse> jobs = bookingService.getAvailableJobsForProvider(user.getId());
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @GetMapping("/active")
    @Operation(summary = "Get currently active accepted or in-progress job for provider")
    public ResponseEntity<ApiResponse<BookingResponse>> getActiveJob(@AuthenticationPrincipal User user) {
        BookingResponse activeJob = bookingService.getProviderActiveJob(user.getId());
        return ResponseEntity.ok(ApiResponse.success(activeJob));
    }

    @GetMapping("/history")
    @Operation(summary = "Get past job history and completed services for provider")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getJobHistory(@AuthenticationPrincipal User user) {
        List<BookingResponse> history = bookingService.getProviderJobHistory(user.getId());
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @PostMapping("/{id}/accept")
    @Operation(summary = "Accept an available job request", description = "Uses optimistic locking (@Version). First provider to accept wins; concurrent attempts receive conflict notice.")
    public ResponseEntity<ApiResponse<BookingResponse>> acceptJob(@AuthenticationPrincipal User user,
                                                                  @PathVariable Long id) {
        BookingResponse accepted = bookingService.acceptJob(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Job accepted successfully!", accepted));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Dismiss or decline a job request notification")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectJob(@AuthenticationPrincipal User user,
                                                                  @PathVariable Long id) {
        BookingResponse rejected = bookingService.rejectJob(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Job dismissed", rejected));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update job status: ON_THE_WAY -> IN_PROGRESS -> COMPLETED")
    public ResponseEntity<ApiResponse<BookingResponse>> updateJobStatus(@AuthenticationPrincipal User user,
                                                                        @PathVariable Long id,
                                                                        @Valid @RequestBody UpdateJobStatusRequest request) {
        BookingResponse updated = bookingService.updateJobStatus(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Status updated to " + request.getStatus(), updated));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel an accepted job with explanation")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelJob(@AuthenticationPrincipal User user,
                                                                  @PathVariable Long id,
                                                                  @Valid @RequestBody CancelBookingRequest request) {
        BookingResponse cancelled = bookingService.cancelBooking(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Job cancelled", cancelled));
    }
}
