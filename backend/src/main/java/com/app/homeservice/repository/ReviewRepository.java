package com.app.homeservice.repository;

import com.app.homeservice.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProviderIdOrderByCreatedAtDesc(Long providerId);

    List<Review> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<Review> findByRequestId(Long requestId);

    boolean existsByRequestId(Long requestId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.provider.id = :providerId")
    Double getAverageRatingByProviderId(@Param("providerId") Long providerId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.provider.id = :providerId")
    long countByProviderId(@Param("providerId") Long providerId);
}
