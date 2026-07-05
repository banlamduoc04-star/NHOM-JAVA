package com.seal.hackathon.repository;

import com.seal.hackathon.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {
    List<AuditLog> findByEntityName(String entityName);
    List<AuditLog> findByUserId(Integer userId);
}
