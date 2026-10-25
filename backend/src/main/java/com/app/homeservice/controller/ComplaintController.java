package com.app.homeservice.controller;

import com.app.homeservice.dto.ApiResponse;
import com.app.homeservice.dto.ComplaintRequest;
import com.app.homeservice.dto.ComplaintResponse;
import com.app.homeservice.entity.ComplaintStatus;
import com.app.homeservice.entity.User;
import com.app.homeservice.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@Tag(name = "Complaints & Disputes", description = "Endpoints for lodging complaints and admin resolution")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping("/customer/complaints")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "File a complaint or dispute")
    public ResponseEntity<ApiResponse<ComplaintResponse>> fileComplaint(
            @Valid @RequestBody ComplaintRequest request,
            @AuthenticationPrincipal User currentUser) {
        ComplaintResponse response = complaintService.fileComplaint(currentUser.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Complaint registered successfully. Our team will review it.", response), HttpStatus.CREATED);
    }

    @GetMapping("/customer/complaints/my")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Get all complaints filed by current user")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getMyComplaints(@AuthenticationPrincipal User currentUser) {
        List<ComplaintResponse> list = complaintService.getComplaintsByUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("User complaints", list));
    }

    @GetMapping("/admin/complaints")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all complaints across the system (Admin only)")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getAllComplaints() {
        List<ComplaintResponse> list = complaintService.getAllComplaints();
        return ResponseEntity.ok(ApiResponse.success("All complaints", list));
    }

    @PatchMapping("/admin/complaints/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update complaint status and resolution notes (Admin only)")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaint(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.getOrDefault("status", "RESOLVED");
        String resolutionNotes = body.get("resolutionNotes");
        ComplaintStatus status = ComplaintStatus.valueOf(statusStr.toUpperCase());

        ComplaintResponse response = complaintService.updateComplaintStatus(id, status, resolutionNotes);
        return ResponseEntity.ok(ApiResponse.success("Complaint status updated", response));
    }
}
