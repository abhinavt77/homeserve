package com.app.homeservice.repository;

import com.app.homeservice.entity.Complaint;
import com.app.homeservice.entity.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);

    List<Complaint> findAllByOrderByCreatedAtDesc();

    long countByStatus(ComplaintStatus status);
}
