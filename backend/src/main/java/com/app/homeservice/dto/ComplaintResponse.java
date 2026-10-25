package com.app.homeservice.dto;

import com.app.homeservice.entity.Complaint;
import com.app.homeservice.entity.ComplaintStatus;
import java.time.LocalDateTime;

public class ComplaintResponse {

    private Long id;
    private Long requestId;
    private String requestTrackingNumber;
    private Long userId;
    private String userName;
    private String userEmail;
    private String subject;
    private String description;
    private ComplaintStatus status;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ComplaintResponse() {}

    public static ComplaintResponse fromEntity(Complaint complaint) {
        ComplaintResponse res = new ComplaintResponse();
        res.setId(complaint.getId());
        if (complaint.getRequest() != null) {
            res.setRequestId(complaint.getRequest().getId());
            res.setRequestTrackingNumber(complaint.getRequest().getTrackingNumber());
        }
        res.setUserId(complaint.getUser().getId());
        res.setUserName(complaint.getUser().getFullName());
        res.setUserEmail(complaint.getUser().getEmail());
        res.setSubject(complaint.getSubject());
        res.setDescription(complaint.getDescription());
        res.setStatus(complaint.getStatus());
        res.setResolutionNotes(complaint.getResolutionNotes());
        res.setCreatedAt(complaint.getCreatedAt());
        res.setUpdatedAt(complaint.getUpdatedAt());
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public String getRequestTrackingNumber() {
        return requestTrackingNumber;
    }

    public void setRequestTrackingNumber(String requestTrackingNumber) {
        this.requestTrackingNumber = requestTrackingNumber;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
