package com.app.homeservice.service.impl;

import com.app.homeservice.dto.ReviewRequest;
import com.app.homeservice.dto.ReviewResponse;
import com.app.homeservice.entity.Notification;
import com.app.homeservice.entity.ProviderProfile;
import com.app.homeservice.entity.RequestStatus;
import com.app.homeservice.entity.Review;
import com.app.homeservice.entity.ServiceRequest;
import com.app.homeservice.exception.BadRequestException;
import com.app.homeservice.exception.ResourceNotFoundException;
import com.app.homeservice.repository.NotificationRepository;
import com.app.homeservice.repository.ProviderProfileRepository;
import com.app.homeservice.repository.ReviewRepository;
import com.app.homeservice.repository.ServiceRequestRepository;
import com.app.homeservice.service.ReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    private static final Logger log = LoggerFactory.getLogger(ReviewServiceImpl.class);

    private final ReviewRepository reviewRepository;
    private final ServiceRequestRepository requestRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final NotificationRepository notificationRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                             ServiceRequestRepository requestRepository,
                             ProviderProfileRepository providerProfileRepository,
                             NotificationRepository notificationRepository) {
        this.reviewRepository = reviewRepository;
        this.requestRepository = requestRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional
    public ReviewResponse createReview(Long customerId, Long bookingId, ReviewRequest requestDto) {
        ServiceRequest booking = requestRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!booking.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("You can only review bookings that belong to your account.");
        }

        if (booking.getStatus() != RequestStatus.COMPLETED && booking.getStatus() != RequestStatus.PAID) {
            throw new BadRequestException("You can only review a booking that has been COMPLETED or PAID.");
        }

        if (booking.getProvider() == null) {
            throw new BadRequestException("No provider was assigned to this booking.");
        }

        if (reviewRepository.existsByRequestId(bookingId)) {
            throw new BadRequestException("You have already reviewed this booking.");
        }

        Review review = new Review(
                booking,
                booking.getCustomer(),
                booking.getProvider(),
                requestDto.getRating(),
                requestDto.getComment() != null ? requestDto.getComment().trim() : null
        );

        Review saved = reviewRepository.save(review);

        // Recalculate and update provider rating in ProviderProfile
        Optional<ProviderProfile> profileOpt = providerProfileRepository.findByUserId(booking.getProvider().getId());
        if (profileOpt.isPresent()) {
            ProviderProfile profile = profileOpt.get();
            Double avg = reviewRepository.getAverageRatingByProviderId(booking.getProvider().getId());
            long count = reviewRepository.countByProviderId(booking.getProvider().getId());

            if (avg != null) {
                profile.setAverageRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
            } else {
                profile.setAverageRating(BigDecimal.valueOf(requestDto.getRating()).setScale(2, RoundingMode.HALF_UP));
            }
            profile.setTotalReviews((int) count);
            providerProfileRepository.save(profile);
            log.info("Updated provider #{} rating to {} (total reviews: {})", profile.getUser().getId(), profile.getAverageRating(), profile.getTotalReviews());
        }

        // Notify provider of new review
        Notification notif = new Notification(
                booking.getProvider(),
                "New Review Received (" + requestDto.getRating() + "★)",
                booking.getCustomer().getFullName() + " submitted a " + requestDto.getRating() + "-star review for job #" + booking.getTrackingNumber(),
                "REVIEW",
                saved.getId()
        );
        notificationRepository.save(notif);

        return ReviewResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsForProvider(Long providerId) {
        return reviewRepository.findByProviderIdOrderByCreatedAtDesc(providerId).stream()
                .map(ReviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewForBooking(Long bookingId) {
        return reviewRepository.findByRequestId(bookingId)
                .map(ReviewResponse::fromEntity)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByCustomer(Long customerId) {
        return reviewRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(ReviewResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
