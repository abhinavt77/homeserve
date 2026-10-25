package com.app.homeservice.repository;

import com.app.homeservice.entity.RequestStatus;
import com.app.homeservice.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    Optional<ServiceRequest> findByTrackingNumber(String trackingNumber);

    List<ServiceRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<ServiceRequest> findByProviderIdOrderByCreatedAtDesc(Long providerId);

    List<ServiceRequest> findByProviderIdAndStatusIn(Long providerId, Collection<RequestStatus> statuses);

    List<ServiceRequest> findByStatus(RequestStatus status);

    List<ServiceRequest> findByStatusAndCreatedAtBefore(RequestStatus status, LocalDateTime dateTime);

    long countByStatus(RequestStatus status);

    List<ServiceRequest> findAllByOrderByCreatedAtDesc();

    List<ServiceRequest> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT r.category.id, r.category.name, r.category.code, COUNT(r), SUM(COALESCE(r.finalCost, r.estimatedCost)) FROM ServiceRequest r GROUP BY r.category.id, r.category.name, r.category.code")
    List<Object[]> getStatsByCategory();

    @Query(value = """
        SELECT r.*
        FROM service_requests r
        JOIN addresses a ON r.address_id = a.id
        WHERE r.status = 'PENDING'
          AND r.category_id = :categoryId
          AND (6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
                cos(radians(:providerLat)) * cos(radians(a.latitude)) *
                cos(radians(a.longitude) - radians(:providerLng)) +
                sin(radians(:providerLat)) * sin(radians(a.latitude))
            ))
          )) <= r.search_radius_km
        ORDER BY r.created_at DESC
        """, nativeQuery = true)
    List<ServiceRequest> findAvailableJobsForProvider(
            @Param("categoryId") Long categoryId,
            @Param("providerLat") double providerLat,
            @Param("providerLng") double providerLng
    );
}
