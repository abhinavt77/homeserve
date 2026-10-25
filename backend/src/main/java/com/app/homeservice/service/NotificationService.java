package com.app.homeservice.service;

import com.app.homeservice.dto.BookingResponse;
import com.app.homeservice.dto.NotificationResponse;
import com.app.homeservice.entity.ProviderProfile;
import com.app.homeservice.entity.ServiceRequest;

import java.util.List;

public interface NotificationService {
    void notifyMatchingProvidersNewRequest(ServiceRequest request, List<ProviderProfile> matchingProviders);
    void notifyBookingStatusUpdate(ServiceRequest request, BookingResponse response);
    void notifyBookingCreated(ServiceRequest request);
    void notifyBookingAccepted(ServiceRequest request);
    void notifyBookingCompleted(ServiceRequest request);

    List<NotificationResponse> getUserNotifications(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
}
