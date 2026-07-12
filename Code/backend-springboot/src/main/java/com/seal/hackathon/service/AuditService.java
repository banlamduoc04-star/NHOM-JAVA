package com.seal.hackathon.service;

import com.seal.hackathon.entity.AuditLog;
import com.seal.hackathon.repository.AuditLogRepository;
import org.springframework.stereotype.Service;


@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;


    public AuditService(
            AuditLogRepository auditLogRepository
    ) {
        this.auditLogRepository = auditLogRepository;
    }


    public void log(
            Integer userId,
            String actionName,
            String entityName,
            Integer entityId,
            String oldValue,
            String newValue
    ) {

        AuditLog log = new AuditLog();

        log.userId = userId;
        log.actionName = actionName;
        log.entityName = entityName;
        log.entityId = entityId;
        log.oldValue = oldValue;
        log.newValue = newValue;


        auditLogRepository.save(log);
    }
}