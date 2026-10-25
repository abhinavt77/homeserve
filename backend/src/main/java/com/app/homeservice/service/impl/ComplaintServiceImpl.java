package com.app.homeservice.service.impl;

import com.app.homeservice.dto.ComplaintRequest;
import com.app.homeservice.dto.ComplaintResponse;
import com.app.homeservice.entity.Complaint;
import com.app.homeservice.entity.ComplaintStatus;
import com.app.homeservice.entity.Notification;
import com.app.homeservice.entity.ServiceRequest;
import com.app.homeservice.entity.User;
import com.app.homeservice.exception.BadRequestException;
import com.app.homeservice.exception.ResourceNotFoundException;
import com.app.homeservice.repository.ComplaintRepository;
import com.app.homeservice.repository.NotificationRepository;
import com.app.homeservice.repository.ServiceRequestRepository;
import com.app.homeservice.repository.UserRepository;
import com.app.homeservice.service.ComplaintService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintServiceImpl implements ComplaintService {

    private static final Logger log = LoggerFactory.getLogger(ComplaintServiceImpl.class);

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ServiceRequestRepository requestRepository;
    private final NotificationRepository notificationRepository;

    public ComplaintServiceImpl(ComplaintRepository complaintRepository,
                                UserRepository userRepository,
                                ServiceRequestRepository requestRepository,
                                NotificationRepository notificationRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional
    public ComplaintResponse fileComplaint(Long userId, ComplaintRequest requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        ServiceRequest request = null;
        if (requestDto.getRequestId() != null) {
            request = requestRepository.findById(requestDto.getRequestId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service request not found: " + requestDto.getRequestId()));

            boolean isParticipant = request.getCustomer().getId().equals(userId) ||
                    (request.getProvider() != null && request.getProvider().getId().equals(userId));

            if (!isParticipant) {
                throw new BadRequestException("You can only file a complaint for a booking in which you are a customer or assigned provider.");
            }
        }

        Complaint complaint = new Complaint(request, user, requestDto.getSubject().trim(), requestDto.getDescription().trim());
        Complaint saved = complaintRepository.save(complaint);

        // Notify user complaint was received
        Notification notif = new Notification(
                user,
                "Complaint Ticket #" + saved.getId() + " Logged",
                "Your dispute regarding '" + saved.getSubject() + "' has been logged. An administrator will review it shortly.",
                "COMPLAINT",
                saved.getId()
        );
        notificationRepository.save(notif);

        log.info("User #{} filed complaint #{}", userId, saved.getId());
        return ComplaintResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getComplaintsByUser(Long userId) {
        return complaintRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ComplaintResponse updateComplaintStatus(Long complaintId, ComplaintStatus status, String resolutionNotes) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        complaint.setStatus(status);
        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            complaint.setResolutionNotes(resolutionNotes.trim());
        }
        complaint.setUpdatedAt(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);

        // Notify the complainant
        Notification notif = new Notification(
                saved.getUser(),
                "Complaint #" + saved.getId() + " Status Updated: " + status,
                "Admin Resolution: " + (resolutionNotes != null ? resolutionNotes : "Updated to " + status),
                "COMPLAINT_UPDATE",
                saved.getId()
        );
        notificationRepository.save(notif);

        log.info("Complaint #{} updated to status {}", saved.getId(), status);
        return ComplaintResponse.fromEntity(saved);
    }
}
