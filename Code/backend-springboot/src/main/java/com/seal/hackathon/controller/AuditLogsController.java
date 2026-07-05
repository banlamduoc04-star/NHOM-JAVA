package com.seal.hackathon.controller;

import com.seal.hackathon.entity.AuditLog;
import com.seal.hackathon.repository.AuditLogRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@PreAuthorize("hasRole('EventCoordinator')")
public class AuditLogsController {
    private final AuditLogRepository logs;
    public AuditLogsController(AuditLogRepository logs) { this.logs=logs; }
    @GetMapping public List<AuditLog> get(@RequestParam(required=false) Integer userId, @RequestParam(required=false) String entityName) { if(userId!=null) return logs.findByUserId(userId); if(entityName!=null) return logs.findByEntityName(entityName); return logs.findAll(); }
}
