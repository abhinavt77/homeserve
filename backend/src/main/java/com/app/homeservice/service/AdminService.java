package com.app.homeservice.service;

import com.app.homeservice.dto.AdminDashboardStatsResponse;
import com.app.homeservice.dto.BookingResponse;
import com.app.homeservice.dto.PaymentResponse;
import com.app.homeservice.dto.ProviderProfileResponse;
import com.app.homeservice.dto.UserResponse;
import com.app.homeservice.entity.RequestStatus;

import java.util.List;

public interface AdminService {

    AdminDashboardStatsResponse getDashboardStats();

    List<ProviderProfileResponse> getAllProviders(Boolean verified);

    ProviderProfileResponse updateProviderVerification(Long providerProfileId, boolean approved);

    List<UserResponse> getAllUsers();

    UserResponse toggleUserStatus(Long userId, boolean enabled);

    List<BookingResponse> getAllBookings(RequestStatus status);

    List<PaymentResponse> getAllPayments();
}
