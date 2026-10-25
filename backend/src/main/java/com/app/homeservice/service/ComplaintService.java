package com.app.homeservice.service;

import com.app.homeservice.dto.ComplaintRequest;
import com.app.homeservice.dto.ComplaintResponse;
import com.app.homeservice.entity.ComplaintStatus;

import java.util.List;

public interface ComplaintService {

    ComplaintResponse fileComplaint(Long userId, ComplaintRequest request);

    List<ComplaintResponse> getAllComplaints();

    List<ComplaintResponse> getComplaintsByUser(Long userId);

    ComplaintResponse updateComplaintStatus(Long complaintId, ComplaintStatus status, String resolutionNotes);
}
