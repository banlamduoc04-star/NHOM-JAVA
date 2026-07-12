package com.seal.hackathon.controller;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.AuthDtos.CreateStaffAccountRequest;
import com.seal.hackathon.dto.AuthDtos.RejectUserRequest;
import com.seal.hackathon.dto.AuthDtos.UpdateUserRequest;
import com.seal.hackathon.entity.AppUser;
import com.seal.hackathon.repository.AppUserRepository;
import com.seal.hackathon.security.SecurityUtil;
import com.seal.hackathon.service.AuditService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;


@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
public class AdminController {

    private static final Set<String> STAFF_ROLES = Set.of(
            "Mentor",
            "Judge",
            "GuestJudge",
            "EventCoordinator",
            "Admin"
    );


    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final AuditService auditService;


    public AdminController(
            AppUserRepository users,
            PasswordEncoder encoder,
            AuditService auditService
    ) {
        this.users = users;
        this.encoder = encoder;
        this.auditService = auditService;
    }


    @GetMapping("/users")
    public List<AppUser> getUsers(
            @RequestParam(required = false) Boolean approved,
            @RequestParam(required = false) String roleName
    ) {

        List<AppUser> result;

        if (approved != null && roleName != null) {
            result = users.findByIsApprovedAndRoleName(
                    approved,
                    roleName
            );

        } else if (approved != null) {
            result = users.findByIsApproved(approved);

        } else if (roleName != null) {
            result = users.findByRoleName(roleName);

        } else {
            result = users.findAll();
        }


        result.forEach(this::ensureStatus);

        return result;
    }


    @PostMapping("/approveUser/{userId}")
    public AppUser approveUser(
            @PathVariable Integer userId
    ) {

        AppUser user = getUser(userId);

        String old = effectiveStatus(user);

        user.isApproved = true;
        user.accountStatus = "Active";

        AppUser saved = users.save(user);

        auditService.log(
                SecurityUtil.currentUserId(),
                "APPROVE_USER",
                "AppUser",
                userId,
                old,
                "Active"
        );

        return saved;
    }


    @PostMapping("/rejectUser/{userId}")
    public AppUser rejectUser(
            @PathVariable Integer userId,
            @RequestBody(required = false) RejectUserRequest request
    ) {

        AppUser user = getUser(userId);

        String old = effectiveStatus(user);

        user.isApproved = false;
        user.accountStatus = "Rejected";

        AppUser saved = users.save(user);


        auditService.log(
                SecurityUtil.currentUserId(),
                "REJECT_USER",
                "AppUser",
                userId,
                old,
                request == null || request.reason() == null
                        ? "Rejected"
                        : "Rejected - " + request.reason()
        );

        return saved;
    }


    @PostMapping("/create-staff-account")
    public AppUser createStaffAccount(
            @Valid @RequestBody CreateStaffAccountRequest request
    ) {

        String normalizedEmail = request.email()
                .trim()
                .toLowerCase();


        if (users.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }


        validateStaffRole(request.roleName());


        AppUser user = new AppUser();

        user.email = normalizedEmail;
        user.fullName = request.fullName().trim();

        String rawPassword =
                request.password() == null || request.password().isBlank()
                        ? "123456"
                        : request.password();

        user.passwordHash = encoder.encode(rawPassword);
        user.roleName = request.roleName();

        user.userType =
                request.userType() == null || request.userType().isBlank()
                        ? "Staff"
                        : request.userType();

        user.isApproved = true;
        user.accountStatus = "Active";


        AppUser saved = users.save(user);


        auditService.log(
                SecurityUtil.currentUserId(),
                "CREATE_STAFF_ACCOUNT",
                "AppUser",
                saved.userId,
                null,
                saved.roleName
        );


        return saved;
    }


    @PutMapping("/users/{userId}")
    public AppUser updateUser(
            @PathVariable Integer userId,
            @RequestBody UpdateUserRequest request
    ) {

        AppUser user = getUser(userId);

        String oldValue =
                user.fullName
                        + " | "
                        + user.email
                        + " | "
                        + user.roleName;


        if (request.fullName() != null
                && !request.fullName().isBlank()) {

            user.fullName = request.fullName().trim();
        }


        if (request.email() != null
                && !request.email().isBlank()) {

            String normalizedEmail = request.email()
                    .trim()
                    .toLowerCase();


            users.findByEmail(normalizedEmail)
                    .ifPresent(existing -> {
                        if (!existing.userId.equals(userId)) {
                            throw new IllegalArgumentException(
                                    "Email đã tồn tại"
                            );
                        }
                    });


            user.email = normalizedEmail;
        }


        if (request.roleName() != null) {
            validateStaffRole(request.roleName());
            user.roleName = request.roleName();
        }


        if (request.userType() != null
                && !request.userType().isBlank()) {

            user.userType = request.userType();
        }


        if (request.password() != null
                && !request.password().isBlank()) {

            if (request.password().length() < 6) {
                throw new IllegalArgumentException(
                        "Mật khẩu phải có ít nhất 6 ký tự"
                );
            }

            user.passwordHash = encoder.encode(request.password());
        }


        AppUser saved = users.save(user);


        auditService.log(
                SecurityUtil.currentUserId(),
                "UPDATE_USER",
                "AppUser",
                userId,
                oldValue,
                saved.fullName
                        + " | "
                        + saved.email
                        + " | "
                        + saved.roleName
        );


        return saved;
    }


    @PatchMapping("/users/{userId}/lock")
    public AppUser lockUser(
            @PathVariable Integer userId
    ) {

        if (userId.equals(SecurityUtil.currentUserId())) {
            throw new IllegalArgumentException(
                    "Không thể khóa chính tài khoản đang đăng nhập"
            );
        }


        AppUser user = getUser(userId);

        String old = effectiveStatus(user);

        user.isApproved = false;
        user.accountStatus = "Locked";


        AppUser saved = users.save(user);


        auditService.log(
                SecurityUtil.currentUserId(),
                "LOCK_USER",
                "AppUser",
                userId,
                old,
                "Locked"
        );


        return saved;
    }


    @PatchMapping("/users/{userId}/unlock")
    public AppUser unlockUser(
            @PathVariable Integer userId
    ) {

        AppUser user = getUser(userId);

        String old = effectiveStatus(user);

        user.isApproved = true;
        user.accountStatus = "Active";


        AppUser saved = users.save(user);


        auditService.log(
                SecurityUtil.currentUserId(),
                "UNLOCK_USER",
                "AppUser",
                userId,
                old,
                "Active"
        );


        return saved;
    }


    private AppUser getUser(Integer userId) {

        AppUser user = users
                .findById(userId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Không tìm thấy người dùng"
                        )
                );

        ensureStatus(user);

        return user;
    }


    private void validateStaffRole(String roleName) {

        if (!STAFF_ROLES.contains(roleName)) {
            throw new IllegalArgumentException(
                    "Vai trò nhân sự không hợp lệ"
            );
        }
    }


    private void ensureStatus(AppUser user) {

        if (user.accountStatus == null
                || user.accountStatus.isBlank()) {

            user.accountStatus =
                    Boolean.TRUE.equals(user.isApproved)
                            ? "Active"
                            : "Pending";
        }
    }


    private String effectiveStatus(AppUser user) {

        ensureStatus(user);

        return user.accountStatus;
    }
}