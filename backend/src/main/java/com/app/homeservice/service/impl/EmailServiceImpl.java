package com.app.homeservice.service.impl;

import com.app.homeservice.entity.ServiceRequest;
import com.app.homeservice.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@homeserve.com}")
    private String fromEmail;

    public EmailServiceImpl(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendBookingCreatedEmail(ServiceRequest request) {
        String recipient = request.getCustomer().getEmail();
        String subject = "HomeServe - Booking Confirmed #" + request.getTrackingNumber();
        String htmlContent = buildCreatedHtml(request);

        sendEmailSafely(recipient, subject, htmlContent);
    }

    @Override
    public void sendBookingAcceptedEmail(ServiceRequest request) {
        String recipient = request.getCustomer().getEmail();
        String providerName = request.getProvider() != null ? request.getProvider().getFullName() : "A service provider";
        String subject = "HomeServe - Provider Assigned for #" + request.getTrackingNumber();
        String htmlContent = buildAcceptedHtml(request, providerName);

        sendEmailSafely(recipient, subject, htmlContent);
    }

    @Override
    public void sendBookingCompletedEmail(ServiceRequest request) {
        String recipient = request.getCustomer().getEmail();
        String subject = "HomeServe - Service Completed & Invoice #" + request.getTrackingNumber();
        String htmlContent = buildCompletedHtml(request);

        sendEmailSafely(recipient, subject, htmlContent);
    }

    private void sendEmailSafely(String to, String subject, String htmlContent) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            if (mailSender == null || fromEmail == null || fromEmail.contains("noreply") || fromEmail.contains(".local")) {
                logSimulatedEmail(to, subject, htmlContent, "Simulation mode (fast non-blocking dispatch)");
                return;
            }

            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                mailSender.send(message);
                log.info("Email notification successfully delivered to {} [{}]", to, subject);
            } catch (Exception ex) {
                logSimulatedEmail(to, subject, htmlContent, ex.getMessage());
            }
        });
    }

    private void logSimulatedEmail(String to, String subject, String htmlContent, String reason) {
        log.info("""
                \n============================== EMAIL NOTIFICATION ==============================
                To: {}
                Subject: {}
                Status: SIMULATED (Reason: {})
                Content Preview:
                {}
                ================================================================================
                """, to, subject, reason, htmlContent.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim());
    }

    private String buildCreatedHtml(ServiceRequest request) {
        return "<h2>Your HomeServe Request is Confirmed!</h2>" +
                "<p>Hi <b>" + request.getCustomer().getFullName() + "</b>,</p>" +
                "<p>We have received your booking for <b>" + request.getCategory().getName() + "</b> service.</p>" +
                "<p><b>Tracking Number:</b> " + request.getTrackingNumber() + "<br/>" +
                "<b>Estimated Cost:</b> &#8377;" + request.getEstimatedCost() + "<br/>" +
                "<b>Address:</b> " + (request.getAddress() != null ? (request.getAddress().getStreet() + ", " + request.getAddress().getCity()) : "N/A") + "<br/>" +
                "<b>Description:</b> " + request.getDescription() + "</p>" +
                "<p>Nearby verified technicians are currently receiving your request. We'll update you as soon as someone accepts!</p>" +
                "<p>Best regards,<br/>The HomeServe Team</p>";
    }

    private String buildAcceptedHtml(ServiceRequest request, String providerName) {
        return "<h2>A Technician has Accepted Your Request!</h2>" +
                "<p>Hi <b>" + request.getCustomer().getFullName() + "</b>,</p>" +
                "<p>Good news! <b>" + providerName + "</b> has accepted your service request #" + request.getTrackingNumber() + ".</p>" +
                "<p>They are preparing to head to your location. You can track their status live on your HomeServe dashboard.</p>" +
                "<p>Best regards,<br/>The HomeServe Team</p>";
    }

    private String buildCompletedHtml(ServiceRequest request) {
        return "<h2>Your Service is Completed!</h2>" +
                "<p>Hi <b>" + request.getCustomer().getFullName() + "</b>,</p>" +
                "<p>Your <b>" + request.getCategory().getName() + "</b> service #" + request.getTrackingNumber() + " has been completed.</p>" +
                "<p><b>Final Cost:</b> &#8377;" + (request.getFinalCost() != null ? request.getFinalCost() : request.getEstimatedCost()) + "</p>" +
                "<p>Please log in to your dashboard to complete payment (if pending) and leave a star rating & review for your specialist!</p>" +
                "<p>Thank you for choosing HomeServe.<br/>The HomeServe Team</p>";
    }
}
