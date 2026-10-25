package com.app.homeservice.service;

import com.app.homeservice.dto.BookingResponse;
import com.app.homeservice.dto.CancelBookingRequest;
import com.app.homeservice.dto.CreateBookingRequest;
import com.app.homeservice.dto.UpdateJobStatusRequest;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(Long customerId, CreateBookingRequest request);
    BookingResponse getBookingById(Long id);
    BookingResponse getBookingByTrackingNumber(String trackingNumber);
    List<BookingResponse> getCustomerBookings(Long customerId);
    List<BookingResponse> getAvailableJobsForProvider(Long providerUserId);
    BookingResponse getProviderActiveJob(Long providerUserId);
    List<BookingResponse> getProviderJobHistory(Long providerUserId);
    BookingResponse acceptJob(Long requestId, Long providerUserId);
    BookingResponse rejectJob(Long requestId, Long providerUserId);
    BookingResponse updateJobStatus(Long requestId, Long providerUserId, UpdateJobStatusRequest request);
    BookingResponse cancelBooking(Long requestId, Long userId, CancelBookingRequest request);
    void processPendingBookingsTimeout();
}
