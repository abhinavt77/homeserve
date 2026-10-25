package com.app.homeservice.service;

import com.app.homeservice.dto.BookingResponse;
import com.app.homeservice.dto.CreateBookingRequest;
import com.app.homeservice.dto.UpdateJobStatusRequest;
import com.app.homeservice.entity.*;
import com.app.homeservice.exception.BadRequestException;
import com.app.homeservice.repository.*;
import com.app.homeservice.service.impl.BookingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private ServiceRequestRepository requestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ServiceCategoryRepository categoryRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private ProviderProfileRepository providerProfileRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User customer;
    private User providerUser;
    private ProviderProfile providerProfile;
    private ServiceCategory category;
    private Address address;
    private ServiceRequest pendingRequest;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(bookingService, "initialRadiusKm", 15.0);
        ReflectionTestUtils.setField(bookingService, "expandedRadiusKm", 35.0);
        ReflectionTestUtils.setField(bookingService, "timeoutMinutes", 5);

        customer = new User(1L, "customer@test.com", "pass", "Customer One", "+919999999991", Role.USER, null, true);
        providerUser = new User(2L, "provider@test.com", "pass", "Provider One", "+919999999992", Role.PROVIDER, null, true);

        category = new ServiceCategory(1L, "Electrician", "ELECTRICIAN", "Wiring repairs", new BigDecimal("299.00"), "url", true);
        address = new Address(customer, "Home", "123 Main St", "Bangalore", "Karnataka", "560001", 12.9716, 77.5946, true);
        address.setId(10L);

        providerProfile = new ProviderProfile(providerUser, category, 5, new BigDecimal("350.00"), "Bio", 12.9710, 77.5940);
        providerProfile.setId(20L);
        providerProfile.setVerified(true);
        providerProfile.setOnline(true);

        pendingRequest = new ServiceRequest("HS-12345678", customer, category, address, "Short circuit repair", null, new BigDecimal("299.00"), 15.0);
        pendingRequest.setId(100L);
        pendingRequest.setStatus(RequestStatus.PENDING);
    }

    @Test
    @DisplayName("Create booking - should save request and find nearby providers")
    void testCreateBooking_Success() {
        CreateBookingRequest createRequest = new CreateBookingRequest(1L, 10L, "Short circuit repair", null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(addressRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(address));
        when(requestRepository.save(any(ServiceRequest.class))).thenReturn(pendingRequest);
        when(providerProfileRepository.findNearbyAvailableProviders(1L, 12.9716, 77.5946, 15.0))
                .thenReturn(List.of(providerProfile));

        BookingResponse response = bookingService.createBooking(1L, createRequest);

        assertNotNull(response);
        assertEquals(RequestStatus.PENDING, response.getStatus());
        assertEquals("Short circuit repair", response.getDescription());
        verify(notificationService).notifyMatchingProvidersNewRequest(any(), any());
        verify(notificationService).notifyBookingCreated(any());
    }

    @Test
    @DisplayName("Accept job - first provider accepts successfully")
    void testAcceptJob_Success() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(providerUser));
        when(providerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(providerProfile));
        when(requestRepository.findById(100L)).thenReturn(Optional.of(pendingRequest));
        when(requestRepository.findByProviderIdAndStatusIn(eq(2L), any())).thenReturn(Collections.emptyList());
        when(requestRepository.saveAndFlush(any(ServiceRequest.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponse response = bookingService.acceptJob(100L, 2L);

        assertNotNull(response);
        assertEquals(RequestStatus.ACCEPTED, response.getStatus());
        verify(notificationService).notifyBookingStatusUpdate(any(), any());
        verify(notificationService).notifyBookingAccepted(any());
    }

    @Test
    @DisplayName("Accept job - rejected when request is no longer PENDING")
    void testAcceptJob_AlreadyAccepted_ThrowsBadRequest() {
        pendingRequest.setStatus(RequestStatus.ACCEPTED);
        when(userRepository.findById(2L)).thenReturn(Optional.of(providerUser));
        when(providerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(providerProfile));
        when(requestRepository.findById(100L)).thenReturn(Optional.of(pendingRequest));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                bookingService.acceptJob(100L, 2L)
        );

        assertTrue(ex.getMessage().contains("no longer pending"));
        verify(requestRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("Accept job - optimistic locking conflict handled gracefully")
    void testAcceptJob_OptimisticLockingConflict() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(providerUser));
        when(providerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(providerProfile));
        when(requestRepository.findById(100L)).thenReturn(Optional.of(pendingRequest));
        when(requestRepository.findByProviderIdAndStatusIn(eq(2L), any())).thenReturn(Collections.emptyList());
        when(requestRepository.saveAndFlush(any(ServiceRequest.class)))
                .thenThrow(new OptimisticLockingFailureException("Row updated by another transaction"));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                bookingService.acceptJob(100L, 2L)
        );

        assertTrue(ex.getMessage().contains("Another provider accepted this request"));
    }

    @Test
    @DisplayName("Update status - invalid transition throws BadRequest")
    void testUpdateJobStatus_InvalidTransition() {
        pendingRequest.setProvider(providerUser);
        pendingRequest.setStatus(RequestStatus.ACCEPTED);

        when(requestRepository.findById(100L)).thenReturn(Optional.of(pendingRequest));

        // Attempting to jump directly from ACCEPTED to COMPLETED (must go to ON_THE_WAY first)
        UpdateJobStatusRequest updateRequest = new UpdateJobStatusRequest(RequestStatus.COMPLETED, new BigDecimal("350.00"));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                bookingService.updateJobStatus(100L, 2L, updateRequest)
        );

        assertTrue(ex.getMessage().contains("Invalid status transition"));
    }
}
