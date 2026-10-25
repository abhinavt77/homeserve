package com.app.homeservice.service.impl;

import com.app.homeservice.dto.BookingResponse;
import com.app.homeservice.dto.CancelBookingRequest;
import com.app.homeservice.dto.CreateBookingRequest;
import com.app.homeservice.dto.ProviderProfileResponse;
import com.app.homeservice.dto.UpdateJobStatusRequest;
import com.app.homeservice.entity.Address;
import com.app.homeservice.entity.ProviderProfile;
import com.app.homeservice.entity.RequestStatus;
import com.app.homeservice.entity.Role;
import com.app.homeservice.entity.ServiceCategory;
import com.app.homeservice.entity.ServiceRequest;
import com.app.homeservice.entity.User;
import com.app.homeservice.exception.BadRequestException;
import com.app.homeservice.exception.ResourceNotFoundException;
import com.app.homeservice.repository.AddressRepository;
import com.app.homeservice.repository.ProviderProfileRepository;
import com.app.homeservice.repository.ServiceCategoryRepository;
import com.app.homeservice.repository.ServiceRequestRepository;
import com.app.homeservice.repository.UserRepository;
import com.app.homeservice.service.BookingService;
import com.app.homeservice.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingServiceImpl.class);

    private final ServiceRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final AddressRepository addressRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final NotificationService notificationService;

    @Value("${app.matching.initial-radius-km:15.0}")
    private double initialRadiusKm;

    @Value("${app.matching.expanded-radius-km:35.0}")
    private double expandedRadiusKm;

    @Value("${app.matching.timeout-minutes:5}")
    private int timeoutMinutes;

    public BookingServiceImpl(ServiceRequestRepository requestRepository,
                              UserRepository userRepository,
                              ServiceCategoryRepository categoryRepository,
                              AddressRepository addressRepository,
                              ProviderProfileRepository providerProfileRepository,
                              NotificationService notificationService) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.addressRepository = addressRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public BookingResponse createBooking(Long customerId, CreateBookingRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        ServiceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        if (!category.isActive()) {
            throw new BadRequestException("Service category is currently inactive: " + category.getName());
        }

        Address address = addressRepository.findByIdAndUserId(request.getAddressId(), customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or does not belong to you"));

        String trackingNumber = "HS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        ServiceRequest serviceRequest = new ServiceRequest(
                trackingNumber,
                customer,
                category,
                address,
                request.getDescription().trim(),
                request.getScheduledAt(),
                category.getBasePrice(),
                initialRadiusKm
        );

        ServiceRequest saved = requestRepository.save(serviceRequest);
        log.info("Created service request #{} ({}) for customer {}", saved.getId(), trackingNumber, customer.getEmail());

        // Find matching online & verified providers within search radius
        List<ProviderProfile> matchingProviders = providerProfileRepository.findNearbyAvailableProviders(
                category.getId(),
                address.getLatitude(),
                address.getLongitude(),
                initialRadiusKm
        );
        log.info("Found {} nearby providers within {}km for request #{}", matchingProviders.size(), initialRadiusKm, saved.getId());

        // Dispatch notifications via notification service
        notificationService.notifyMatchingProvidersNewRequest(saved, matchingProviders);
        notificationService.notifyBookingCreated(saved);

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        ServiceRequest req = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking request not found with ID: " + id));
        return mapToResponse(req);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingByTrackingNumber(String trackingNumber) {
        ServiceRequest req = requestRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with tracking number: " + trackingNumber));
        return mapToResponse(req);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getCustomerBookings(Long customerId) {
        return requestRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAvailableJobsForProvider(Long providerUserId) {
        Optional<ProviderProfile> profileOpt = providerProfileRepository.findByUserId(providerUserId);
        if (profileOpt.isEmpty()) {
            return List.of();
        }

        ProviderProfile profile = profileOpt.get();
        if (!profile.isOnline() || !profile.isVerified() || profile.getLatitude() == null || profile.getLongitude() == null) {
            return List.of();
        }

        List<ServiceRequest> availableRequests = requestRepository.findAvailableJobsForProvider(
                profile.getServiceCategory().getId(),
                profile.getLatitude(),
                profile.getLongitude()
        );

        return availableRequests.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getProviderActiveJob(Long providerUserId) {
        List<RequestStatus> activeStatuses = Arrays.asList(RequestStatus.ACCEPTED, RequestStatus.ON_THE_WAY, RequestStatus.IN_PROGRESS);
        List<ServiceRequest> active = requestRepository.findByProviderIdAndStatusIn(providerUserId, activeStatuses);
        if (active.isEmpty()) {
            return null;
        }
        return mapToResponse(active.get(0));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getProviderJobHistory(Long providerUserId) {
        return requestRepository.findByProviderIdOrderByCreatedAtDesc(providerUserId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse acceptJob(Long requestId, Long providerUserId) {
        User providerUser = userRepository.findById(providerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider user not found: " + providerUserId));

        ProviderProfile profile = providerProfileRepository.findByUserId(providerUserId)
                .orElseThrow(() -> new BadRequestException("You do not have a provider profile registered"));

        if (!profile.isVerified()) {
            throw new BadRequestException("Your account is not verified yet. Verification by an administrator is required.");
        }

        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with ID: " + requestId));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("This job is no longer pending. It has already been accepted or cancelled.");
        }

        // Check provider already has an active in-progress job
        List<RequestStatus> activeStatuses = Arrays.asList(RequestStatus.ACCEPTED, RequestStatus.ON_THE_WAY, RequestStatus.IN_PROGRESS);
        List<ServiceRequest> currentlyBusy = requestRepository.findByProviderIdAndStatusIn(providerUserId, activeStatuses);
        if (!currentlyBusy.isEmpty()) {
            throw new BadRequestException("You already have an active job in progress (" + currentlyBusy.get(0).getTrackingNumber() + "). Complete it before accepting another.");
        }

        try {
            request.setProvider(providerUser);
            request.setStatus(RequestStatus.ACCEPTED);
            ServiceRequest saved = requestRepository.saveAndFlush(request);

            BookingResponse response = mapToResponse(saved);
            notificationService.notifyBookingStatusUpdate(saved, response);
            notificationService.notifyBookingAccepted(saved);

            log.info("Provider {} successfully accepted job #{} ({})", providerUser.getEmail(), saved.getId(), saved.getTrackingNumber());
            return response;
        } catch (OptimisticLockingFailureException e) {
            log.warn("Optimistic lock conflict: Provider {} lost race to accept request #{}", providerUser.getEmail(), requestId);
            throw new BadRequestException("Sorry! Another provider accepted this request just a moment before you.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse rejectJob(Long requestId, Long providerUserId) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with ID: " + requestId));
        return mapToResponse(request);
    }

    @Override
    @Transactional
    public BookingResponse updateJobStatus(Long requestId, Long providerUserId, UpdateJobStatusRequest request) {
        ServiceRequest serviceRequest = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found: " + requestId));

        if (serviceRequest.getProvider() == null || !serviceRequest.getProvider().getId().equals(providerUserId)) {
            throw new BadRequestException("You are not assigned to this service request.");
        }

        RequestStatus currentStatus = serviceRequest.getStatus();
        RequestStatus newStatus = request.getStatus();

        // Enforce state transition rules
        boolean validTransition = switch (currentStatus) {
            case ACCEPTED -> newStatus == RequestStatus.ON_THE_WAY || newStatus == RequestStatus.CANCELLED;
            case ON_THE_WAY -> newStatus == RequestStatus.IN_PROGRESS || newStatus == RequestStatus.CANCELLED;
            case IN_PROGRESS -> newStatus == RequestStatus.COMPLETED;
            default -> false;
        };

        if (!validTransition) {
            throw new BadRequestException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        serviceRequest.setStatus(newStatus);

        if (newStatus == RequestStatus.COMPLETED) {
            if (request.getFinalCost() != null) {
                serviceRequest.setFinalCost(request.getFinalCost());
            } else if (serviceRequest.getFinalCost() == null) {
                serviceRequest.setFinalCost(serviceRequest.getEstimatedCost());
            }
            notificationService.notifyBookingCompleted(serviceRequest);
        }

        ServiceRequest saved = requestRepository.save(serviceRequest);
        BookingResponse response = mapToResponse(saved);
        notificationService.notifyBookingStatusUpdate(saved, response);

        log.info("Service request #{} updated to status {}", saved.getId(), newStatus);
        return response;
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long requestId, Long userId, CancelBookingRequest request) {
        ServiceRequest serviceRequest = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found: " + requestId));

        boolean isCustomer = serviceRequest.getCustomer().getId().equals(userId);
        boolean isProvider = serviceRequest.getProvider() != null && serviceRequest.getProvider().getId().equals(userId);
        User requestingUser = userRepository.findById(userId).orElseThrow();
        boolean isAdmin = requestingUser.getRole() == Role.ADMIN;

        if (!isCustomer && !isProvider && !isAdmin) {
            throw new BadRequestException("You do not have permission to cancel this booking.");
        }

        if (serviceRequest.getStatus() == RequestStatus.COMPLETED || serviceRequest.getStatus() == RequestStatus.PAID) {
            throw new BadRequestException("Cannot cancel a completed or paid booking.");
        }

        if (serviceRequest.getStatus() == RequestStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled.");
        }

        serviceRequest.setStatus(RequestStatus.CANCELLED);
        serviceRequest.setCancellationReason(request.getReason().trim());
        ServiceRequest saved = requestRepository.save(serviceRequest);

        BookingResponse response = mapToResponse(saved);
        notificationService.notifyBookingStatusUpdate(saved, response);

        log.info("Service request #{} cancelled by user {}. Reason: {}", saved.getId(), userId, request.getReason());
        return response;
    }

    @Override
    @Scheduled(fixedDelay = 30000) // Check every 30 seconds
    @Transactional
    public void processPendingBookingsTimeout() {
        LocalDateTime now = LocalDateTime.now();
        List<ServiceRequest> pendingRequests = requestRepository.findByStatus(RequestStatus.PENDING);

        for (ServiceRequest req : pendingRequests) {
            // Check if older than timeout minutes -> expire
            if (req.getCreatedAt().plusMinutes(timeoutMinutes).isBefore(now)) {
                req.setStatus(RequestStatus.EXPIRED);
                req.setCancellationReason("No providers accepted within the timeout window (" + timeoutMinutes + " mins).");
                ServiceRequest saved = requestRepository.save(req);
                BookingResponse response = mapToResponse(saved);
                notificationService.notifyBookingStatusUpdate(saved, response);
                log.info("Service request #{} marked EXPIRED after timeout", req.getId());
            }
            // Check if older than 2 minutes and radius not yet expanded -> expand radius
            else if (req.getSearchRadiusKm() < expandedRadiusKm && req.getCreatedAt().plusMinutes(2).isBefore(now)) {
                req.setSearchRadiusKm(expandedRadiusKm);
                ServiceRequest saved = requestRepository.save(req);
                log.info("Expanded search radius to {}km for request #{}", expandedRadiusKm, req.getId());

                List<ProviderProfile> newlyFound = providerProfileRepository.findNearbyAvailableProviders(
                        req.getCategory().getId(),
                        req.getAddress().getLatitude(),
                        req.getAddress().getLongitude(),
                        expandedRadiusKm
                );
                notificationService.notifyMatchingProvidersNewRequest(saved, newlyFound);
            }
        }
    }

    private BookingResponse mapToResponse(ServiceRequest req) {
        ProviderProfileResponse providerProfile = null;
        if (req.getProvider() != null) {
            Optional<ProviderProfile> p = providerProfileRepository.findByUserId(req.getProvider().getId());
            providerProfile = p.map(ProviderProfileResponse::fromEntity).orElse(null);
        }
        return BookingResponse.fromEntity(req, providerProfile);
    }
}
