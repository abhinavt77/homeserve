package com.app.homeservice.service;

import com.app.homeservice.dto.ReviewRequest;
import com.app.homeservice.dto.ReviewResponse;
import com.app.homeservice.entity.Notification;
import com.app.homeservice.entity.ProviderProfile;
import com.app.homeservice.entity.RequestStatus;
import com.app.homeservice.entity.Role;
import com.app.homeservice.entity.Review;
import com.app.homeservice.entity.ServiceCategory;
import com.app.homeservice.entity.ServiceRequest;
import com.app.homeservice.entity.User;
import com.app.homeservice.exception.BadRequestException;
import com.app.homeservice.repository.NotificationRepository;
import com.app.homeservice.repository.ProviderProfileRepository;
import com.app.homeservice.repository.ReviewRepository;
import com.app.homeservice.repository.ServiceRequestRepository;
import com.app.homeservice.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ServiceRequestRepository requestRepository;

    @Mock
    private ProviderProfileRepository providerProfileRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private User customer;
    private User providerUser;
    private ServiceRequest completedBooking;
    private ProviderProfile providerProfile;

    @BeforeEach
    void setUp() {
        customer = new User(1L, "customer@test.com", "pass", "Customer One", "9876543210", Role.USER, null, true);
        providerUser = new User(2L, "tech@test.com", "pass", "Tech Specialist", "9876543211", Role.PROVIDER, null, true);

        ServiceCategory cat = new ServiceCategory(10L, "Electrician", "ELECTRICIAN", "Electrical", BigDecimal.valueOf(250), "icon", true);

        completedBooking = new ServiceRequest();
        completedBooking.setId(100L);
        completedBooking.setTrackingNumber("HS-REVIEW-100");
        completedBooking.setCustomer(customer);
        completedBooking.setProvider(providerUser);
        completedBooking.setCategory(cat);
        completedBooking.setStatus(RequestStatus.COMPLETED);

        providerProfile = new ProviderProfile();
        providerProfile.setId(20L);
        providerProfile.setUser(providerUser);
        providerProfile.setServiceCategory(cat);
        providerProfile.setAverageRating(BigDecimal.valueOf(5.0));
        providerProfile.setTotalReviews(0);
    }

    @Test
    @DisplayName("Submit review successfully for completed booking and update provider average rating")
    void createReview_Success() {
        ReviewRequest requestDto = new ReviewRequest(5, "Punctual and very efficient work!");

        when(requestRepository.findById(100L)).thenReturn(Optional.of(completedBooking));
        when(reviewRepository.existsByRequestId(100L)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            r.setId(500L);
            return r;
        });
        when(providerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(providerProfile));
        when(reviewRepository.getAverageRatingByProviderId(2L)).thenReturn(5.0);
        when(reviewRepository.countByProviderId(2L)).thenReturn(1L);

        ReviewResponse response = reviewService.createReview(1L, 100L, requestDto);

        assertNotNull(response);
        assertEquals(5, response.getRating());
        assertEquals("Punctual and very efficient work!", response.getComment());
        verify(providerProfileRepository, times(1)).save(providerProfile);
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("Reject review if another customer tries to review booking")
    void createReview_UnauthorizedCustomer_ThrowsException() {
        ReviewRequest requestDto = new ReviewRequest(4, "Good service");
        when(requestRepository.findById(100L)).thenReturn(Optional.of(completedBooking));

        assertThrows(BadRequestException.class, () -> reviewService.createReview(999L, 100L, requestDto));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("Reject review if booking is still PENDING or IN_PROGRESS")
    void createReview_BookingNotCompleted_ThrowsException() {
        completedBooking.setStatus(RequestStatus.IN_PROGRESS);
        ReviewRequest requestDto = new ReviewRequest(5, "Great so far");
        when(requestRepository.findById(100L)).thenReturn(Optional.of(completedBooking));

        assertThrows(BadRequestException.class, () -> reviewService.createReview(1L, 100L, requestDto));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("Reject duplicate review submission for the same booking")
    void createReview_DuplicateReview_ThrowsException() {
        ReviewRequest requestDto = new ReviewRequest(5, "Second review attempt");
        when(requestRepository.findById(100L)).thenReturn(Optional.of(completedBooking));
        when(reviewRepository.existsByRequestId(100L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> reviewService.createReview(1L, 100L, requestDto));
        verify(reviewRepository, never()).save(any());
    }
}
