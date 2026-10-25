package com.app.homeservice.service;

import com.app.homeservice.dto.ReviewRequest;
import com.app.homeservice.dto.ReviewResponse;

import java.util.List;

public interface ReviewService {

    ReviewResponse createReview(Long customerId, Long bookingId, ReviewRequest request);

    List<ReviewResponse> getReviewsForProvider(Long providerId);

    ReviewResponse getReviewForBooking(Long bookingId);

    List<ReviewResponse> getReviewsByCustomer(Long customerId);
}
