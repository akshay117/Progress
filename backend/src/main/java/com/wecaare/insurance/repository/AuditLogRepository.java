package com.wecaare.insurance.repository;

import com.wecaare.insurance.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    // Additional query methods can be added here if needed
}

