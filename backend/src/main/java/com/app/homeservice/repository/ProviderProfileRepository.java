package com.app.homeservice.repository;

import com.app.homeservice.entity.ProviderProfile;
import com.app.homeservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {
    Optional<ProviderProfile> findByUser(User user);
    Optional<ProviderProfile> findByUserId(Long userId);
    List<ProviderProfile> findByIsOnlineTrueAndIsVerifiedTrue();
    List<ProviderProfile> findByIsVerified(boolean verified);
    List<ProviderProfile> findAllByOrderByCreatedAtDesc();
    long countByIsVerified(boolean verified);

    @Query(value = """
        SELECT p.*,
        (6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
                cos(radians(:customerLat)) * cos(radians(p.latitude)) *
                cos(radians(p.longitude) - radians(:customerLng)) +
                sin(radians(:customerLat)) * sin(radians(p.latitude))
            ))
        )) AS distance
        FROM provider_profiles p
        WHERE p.is_online = true
          AND p.is_verified = true
          AND p.service_category_id = :categoryId
          AND p.latitude IS NOT NULL
          AND p.longitude IS NOT NULL
          AND (6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
                cos(radians(:customerLat)) * cos(radians(p.latitude)) *
                cos(radians(p.longitude) - radians(:customerLng)) +
                sin(radians(:customerLat)) * sin(radians(p.latitude))
            ))
          )) <= :radiusKm
        ORDER BY distance ASC
        """, nativeQuery = true)
    List<ProviderProfile> findNearbyAvailableProviders(
            @Param("categoryId") Long categoryId,
            @Param("customerLat") double customerLat,
            @Param("customerLng") double customerLng,
            @Param("radiusKm") double radiusKm
    );
}
