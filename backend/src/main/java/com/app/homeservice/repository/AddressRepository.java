package com.app.homeservice.repository;

import com.app.homeservice.entity.Address;
import com.app.homeservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserOrderByIsDefaultDescCreatedAtDesc(User user);
    List<Address> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);
    Optional<Address> findByIdAndUserId(Long id, Long userId);
    Optional<Address> findByUserIdAndIsDefaultTrue(Long userId);
}
