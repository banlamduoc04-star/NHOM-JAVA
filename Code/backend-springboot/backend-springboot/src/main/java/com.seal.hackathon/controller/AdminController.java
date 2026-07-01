package com.seal.hackathon.controller;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.AuthDtos.*;
import com.seal.hackathon.entity.AppUser;
import com.seal.hackathon.repository.AppUserRepository;
import com.seal.hackathon.security.SecurityUtil;
import com.seal.hackathon.service.AuditService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('EventCoordinator')")
public class AdminController {
    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final AuditService auditService;

    public AdminController(AppUserRepository users, PasswordEncoder encoder, AuditService auditService) {
        this.users = users;
        this.encoder = encoder;
        this.auditService = auditService;
    }

    @GetMapping("/users")
    public List<AppUser> getUsers(@RequestParam(required = false) Boolean approved, @RequestParam(required = false) String roleName) {
        if (approved != null && roleName != null) return users.findByIsApprovedAndRoleName(approved, roleName);
        if (approved != null) return users.findByIsApproved(approved);
        if (roleName != null) return users.findByRoleName(roleName);
        return users.findAll();
    }

    @PostMapping("/approveUser/{userId}")
    public AppUser approveUser(@PathVariable Integer userId) {
        AppUser user = users.findById(userId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        user.isApproved = true;
        AppUser saved = users.save(user);
        auditService.log(SecurityUtil.currentUserId(), "APPROVE_USER", "AppUser", userId, null, "approved=true");
        return saved;
    }

    @PostMapping("/rejectUser/{userId}")
    public AppUser rejectUser(@PathVariable Integer userId, @RequestBody RejectUserRequest request) {
        AppUser user = users.findById(userId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        user.isApproved = false;
        AppUser saved = users.save(user);
        auditService.log(SecurityUtil.currentUserId(), "REJECT_USER", "AppUser", userId, null, request == null ? null : request.reason());
        return saved;
    }

    @PostMapping("/create-staff-account")
    public AppUser createStaffAccount(@Valid @RequestBody CreateStaffAccountRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (users.existsByEmail(normalizedEmail)) throw new IllegalArgumentException("Email đã tồn tại");
        AppUser user = new AppUser();
        user.email = normalizedEmail;
        user.fullName = request.fullName().trim();
        user.passwordHash = encoder.encode(request.password());
        user.roleName = request.roleName();
        user.userType = request.userType() == null ? "Staff" : request.userType();
        user.isApproved = true;
        AppUser saved = users.save(user);
        auditService.log(SecurityUtil.currentUserId(), "CREATE_STAFF_ACCOUNT", "AppUser", saved.userId, null, saved.roleName);
        return saved;
    }
}