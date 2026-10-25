package com.app.homeservice.service;

import com.app.homeservice.entity.ServiceRequest;

public interface EmailService {
    void sendBookingCreatedEmail(ServiceRequest request);
    void sendBookingAcceptedEmail(ServiceRequest request);
    void sendBookingCompletedEmail(ServiceRequest request);
}
