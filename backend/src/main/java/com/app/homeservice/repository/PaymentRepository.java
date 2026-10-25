package com.app.homeservice.repository;

import com.app.homeservice.entity.Payment;
import com.app.homeservice.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByServiceRequestId(Long requestId);
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    List<Payment> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Payment> findByPaymentStatus(PaymentStatus status);
    List<Payment> findAllByOrderByCreatedAtDesc();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'SUCCESS'")
    BigDecimal calculateTotalRevenue();
}
