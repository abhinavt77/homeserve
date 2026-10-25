package com.app.homeservice.service.impl;

import com.app.homeservice.dto.BookingResponse;
import com.app.homeservice.dto.NotificationResponse;
import com.app.homeservice.entity.Notification;
import com.app.homeservice.entity.ProviderProfile;
import com.app.homeservice.entity.ServiceRequest;
import com.app.homeservice.entity.User;
import com.app.homeservice.repository.NotificationRepository;
import com.app.homeservice.service.EmailService;
import com.app.homeservice.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    public NotificationServiceImpl(@Lazy SimpMessagingTemplate messagingTemplate,
                                   NotificationRepository notificationRepository,
                                   EmailService emailService) {
        this.messagingTemplate = messagingTemplate;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public void notifyMatchingProvidersNewRequest(ServiceRequest request, List<ProviderProfile> matchingProviders) {
        log.info("WebSocket Broadcast: New Request #{} pushed to {} matching providers", request.getId(), matchingProviders.size());

        BookingResponse payload = BookingResponse.fromEntity(request, null);

        try {
            // Category Broadcast Topic
            messagingTemplate.convertAndSend("/topic/jobs/" + request.getCategory().getCode(), payload);

            // Direct Provider Queues and Save Persistent DB Notifications
            for (ProviderProfile p : matchingProviders) {
                User providerUser = p.getUser();
                if (providerUser != null) {
                    messagingTemplate.convertAndSend("/topic/provider/" + providerUser.getId() + "/jobs", payload);

                    Notification notif = new Notification(
                            providerUser,
                            "New " + request.getCategory().getName() + " Request Nearby",
                            "New request near " + request.getAddress().getCity() + ": " + request.getDescription(),
                            "NEW_REQUEST",
                            request.getId()
                    );
                    notificationRepository.save(notif);
                }
            }
        } catch (Exception e) {
            log.warn("WebSocket dispatch warning: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void notifyBookingStatusUpdate(ServiceRequest request, BookingResponse response) {
        log.info("WebSocket Broadcast: Booking #{} updated to {}", request.getId(), request.getStatus());

        try {
            // Live Tracking Topic for this specific booking
            messagingTemplate.convertAndSend("/topic/tracking/" + request.getTrackingNumber(), response);

            // Customer Feed Topic
            messagingTemplate.convertAndSend("/topic/customer/" + request.getCustomer().getId() + "/bookings", response);

            // Provider Feed Topic
            if (request.getProvider() != null) {
                messagingTemplate.convertAndSend("/topic/provider/" + request.getProvider().getId() + "/active", response);
            }
        } catch (Exception e) {
            log.warn("WebSocket dispatch warning: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void notifyBookingCreated(ServiceRequest request) {
        Notification notif = new Notification(
                request.getCustomer(),
                "Booking Confirmed: " + request.getTrackingNumber(),
                "Your " + request.getCategory().getName() + " request has been created and broadcast to nearby technicians.",
                "BOOKING_UPDATE",
                request.getId()
        );
        notificationRepository.save(notif);
        emailService.sendBookingCreatedEmail(request);
    }

    @Override
    @Transactional
    public void notifyBookingAccepted(ServiceRequest request) {
        String providerName = request.getProvider() != null ? request.getProvider().getFullName() : "A technician";
        Notification notif = new Notification(
                request.getCustomer(),
                "Provider Assigned!",
                providerName + " has accepted your service request and will be on the way shortly.",
                "BOOKING_UPDATE",
                request.getId()
        );
        notificationRepository.save(notif);
        emailService.sendBookingAcceptedEmail(request);
    }

    @Override
    @Transactional
    public void notifyBookingCompleted(ServiceRequest request) {
        Notification notif = new Notification(
                request.getCustomer(),
                "Service Completed",
                "Your " + request.getCategory().getName() + " service is completed. Please review and complete payment.",
                "BOOKING_UPDATE",
                request.getId()
        );
        notificationRepository.save(notif);
        emailService.sendBookingCompletedEmail(request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
