package com.app.homeservice.controller;

import com.app.homeservice.dto.ApiResponse;
import com.app.homeservice.dto.ReviewRequest;
import com.app.homeservice.dto.ReviewResponse;
import com.app.homeservice.entity.User;
import com.app.homeservice.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@Tag(name = "Reviews & Ratings", description = "Endpoints for posting and viewing technician reviews and ratings")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/customer/reviews/{bookingId}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Submit review and rating for a completed or paid booking")
    public ResponseEntity<ApiResponse<ReviewResponse>> submitReview(
            @PathVariable Long bookingId,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal User currentUser) {
        ReviewResponse response = reviewService.createReview(currentUser.getId(), bookingId, request);
        return new ResponseEntity<>(ApiResponse.success("Thank you! Review submitted successfully.", response), HttpStatus.CREATED);
    }

    @GetMapping("/customer/reviews/booking/{bookingId}")
    @PreAuthorize("hasAnyRole('USER', 'PROVIDER', 'ADMIN')")
    @Operation(summary = "Get review details for a specific booking")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewForBooking(@PathVariable Long bookingId) {
        ReviewResponse review = reviewService.getReviewForBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Review retrieved", review));
    }

    @GetMapping("/customer/reviews/my")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Get all reviews submitted by the current customer")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getMyReviews(@AuthenticationPrincipal User currentUser) {
        List<ReviewResponse> list = reviewService.getReviewsByCustomer(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Customer reviews", list));
    }

    @GetMapping("/public/providers/{providerId}/reviews")
    @Operation(summary = "Get public reviews and star ratings for a provider")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getProviderReviews(@PathVariable Long providerId) {
        List<ReviewResponse> list = reviewService.getReviewsForProvider(providerId);
        return ResponseEntity.ok(ApiResponse.success("Provider reviews", list));
    }
}
