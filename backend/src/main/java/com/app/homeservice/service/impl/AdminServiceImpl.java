package com.app.homeservice.service.impl;

import com.app.homeservice.dto.AdminDashboardStatsResponse;
import com.app.homeservice.dto.BookingResponse;
import com.app.homeservice.dto.PaymentResponse;
import com.app.homeservice.dto.ProviderProfileResponse;
import com.app.homeservice.dto.UserResponse;
import com.app.homeservice.entity.ComplaintStatus;
import com.app.homeservice.entity.Notification;
import com.app.homeservice.entity.ProviderProfile;
import com.app.homeservice.entity.RequestStatus;
import com.app.homeservice.entity.Role;
import com.app.homeservice.entity.ServiceRequest;
import com.app.homeservice.entity.User;
import com.app.homeservice.exception.BadRequestException;
import com.app.homeservice.exception.ResourceNotFoundException;
import com.app.homeservice.repository.ComplaintRepository;
import com.app.homeservice.repository.NotificationRepository;
import com.app.homeservice.repository.PaymentRepository;
import com.app.homeservice.repository.ProviderProfileRepository;
import com.app.homeservice.repository.ServiceRequestRepository;
import com.app.homeservice.repository.UserRepository;
import com.app.homeservice.service.AdminService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminServiceImpl.class);

    private final ServiceRequestRepository requestRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final ComplaintRepository complaintRepository;
    private final NotificationRepository notificationRepository;

    public AdminServiceImpl(ServiceRequestRepository requestRepository,
                            PaymentRepository paymentRepository,
                            UserRepository userRepository,
                            ProviderProfileRepository providerProfileRepository,
                            ComplaintRepository complaintRepository,
                            NotificationRepository notificationRepository) {
        this.requestRepository = requestRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.complaintRepository = complaintRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardStats() {
        AdminDashboardStatsResponse stats = new AdminDashboardStatsResponse();

        stats.setTotalBookings(requestRepository.count());
        stats.setCompletedBookings(
                requestRepository.countByStatus(RequestStatus.COMPLETED) +
                requestRepository.countByStatus(RequestStatus.PAID)
        );
        stats.setPendingBookings(requestRepository.countByStatus(RequestStatus.PENDING));
        stats.setInProgressBookings(
                requestRepository.countByStatus(RequestStatus.ACCEPTED) +
                requestRepository.countByStatus(RequestStatus.ON_THE_WAY) +
                requestRepository.countByStatus(RequestStatus.IN_PROGRESS)
        );
        stats.setCancelledBookings(
                requestRepository.countByStatus(RequestStatus.CANCELLED) +
                requestRepository.countByStatus(RequestStatus.EXPIRED)
        );

        BigDecimal revenue = paymentRepository.calculateTotalRevenue();
        stats.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);

        stats.setTotalCustomers(userRepository.countByRole(Role.USER));
        stats.setTotalProviders(userRepository.countByRole(Role.PROVIDER));
        stats.setVerifiedProviders(providerProfileRepository.countByIsVerified(true));
        stats.setPendingVerifications(providerProfileRepository.countByIsVerified(false));

        stats.setOpenComplaints(
                complaintRepository.countByStatus(ComplaintStatus.OPEN) +
                complaintRepository.countByStatus(ComplaintStatus.IN_REVIEW)
        );

        // Category stats
        List<AdminDashboardStatsResponse.CategoryStatDto> catStats = new ArrayList<>();
        List<Object[]> rows = requestRepository.getStatsByCategory();
        for (Object[] r : rows) {
            String name = (String) r[1];
            String code = (String) r[2];
            long count = ((Number) r[3]).longValue();
            BigDecimal catRev = r[4] != null
                    ? (r[4] instanceof BigDecimal ? (BigDecimal) r[4] : BigDecimal.valueOf(((Number) r[4]).doubleValue()))
                    : BigDecimal.ZERO;
            catStats.add(new AdminDashboardStatsResponse.CategoryStatDto(name, code, count, catRev));
        }
        stats.setCategoryStats(catStats);

        // Recent bookings
        List<BookingResponse> recent = requestRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
        stats.setRecentBookings(recent);

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProviderProfileResponse> getAllProviders(Boolean verified) {
        List<ProviderProfile> list;
        if (verified == null) {
            list = providerProfileRepository.findAllByOrderByCreatedAtDesc();
        } else {
            list = providerProfileRepository.findByIsVerified(verified);
        }
        return list.stream()
                .map(ProviderProfileResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProviderProfileResponse updateProviderVerification(Long providerProfileId, boolean approved) {
        ProviderProfile profile = providerProfileRepository.findById(providerProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found: " + providerProfileId));

        profile.setVerified(approved);
        ProviderProfile saved = providerProfileRepository.save(profile);

        // Push notification to provider
        String title = approved ? "Profile Verification Approved!" : "Profile Verification Revoked";
        String msg = approved
                ? "Congratulations! Your technician profile has been verified by the administrator. You can now toggle online to receive jobs."
                : "Your verification request has been rejected or revoked. Please review your submitted documents or contact support.";

        Notification notif = new Notification(
                saved.getUser(),
                title,
                msg,
                "VERIFICATION",
                saved.getId()
        );
        notificationRepository.save(notif);

        log.info("Admin updated verification for provider {} ({}) to {}", saved.getUser().getId(), saved.getUser().getFullName(), approved);
        return ProviderProfileResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot toggle status of administrator account.");
        }

        user.setEnabled(enabled);
        User saved = userRepository.save(user);

        log.info("Admin updated user #{} enabled status to {}", userId, enabled);
        return UserResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings(RequestStatus status) {
        List<ServiceRequest> list;
        if (status == null) {
            list = requestRepository.findAllByOrderByCreatedAtDesc();
        } else {
            list = requestRepository.findByStatus(status);
        }
        return list.stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(PaymentResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
