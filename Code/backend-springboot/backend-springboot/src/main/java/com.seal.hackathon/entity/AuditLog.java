package com.seal.hackathon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer auditId;
    public Integer userId;
    @Column(nullable = false, length = 100) public String actionName;
    @Column(nullable = false, length = 100) public String entityName;
    public Integer entityId;
    @Column(length = 2000) public String oldValue;
    @Column(length = 2000) public String newValue;
    @Column(nullable = false) public LocalDateTime createdAt = LocalDateTime.now();
}
