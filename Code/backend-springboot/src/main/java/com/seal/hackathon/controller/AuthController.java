package com.seal.hackathon.controller;

import com.seal.hackathon.dto.ApiError;
import com.seal.hackathon.dto.AuthDtos.*;
import com.seal.hackathon.entity.AppUser;
import com.seal.hackathon.repository.AppUserRepository;
import com.seal.hackathon.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthController(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterUserRequest request
    ) {

        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            return ResponseEntity.badRequest()
                    .body(ApiError.of("SE40003", "Email đã tồn tại"));
        }

        String studentType = request.studentType().trim().toUpperCase();

        if (studentType.equals("FPT")
                && (request.fptStudentCode() == null
                || request.fptStudentCode().isBlank())) {

            return ResponseEntity.badRequest()
                    .body(ApiError.of("SE40004", "Vui lòng nhập mã số sinh viên FPT"));
        }

        if (studentType.equals("EXTERNAL")
                && ((request.externalStudentCode() == null
                || request.externalStudentCode().isBlank())
                || (request.universityName() == null
                || request.universityName().isBlank()))) {

            return ResponseEntity.badRequest()
                    .body(ApiError.of("SE40005", "Vui lòng nhập mã số sinh viên và tên trường"));
        }

        AppUser user = new AppUser();

        user.email = normalizedEmail;
        user.fullName = request.fullName().trim();
        user.passwordHash = passwordEncoder.encode(request.password());
        user.roleName = "TeamMember";
        user.userType = "Student";
        user.isApproved = false;
        user.fptStudentCode = request.fptStudentCode();
        user.externalStudentCode = request.externalStudentCode();
        user.universityName = request.universityName();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userRepository.save(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request
    ) {

        AppUser user = userRepository
                .findByEmail(request.email().trim().toLowerCase())
                .orElse(null);

        if (user == null
                || !passwordEncoder.matches(request.password(), user.passwordHash)) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiError.of("SE40101", "Email hoặc mật khẩu không đúng"));
        }

        if (Boolean.FALSE.equals(user.isApproved)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiError.of("SE40302", "Tài khoản đang chờ Ban tổ chức phê duyệt"));
        }

        return ResponseEntity.ok(
                new LoginResponse(
                        jwtUtil.generateToken(user),
                        user.email,
                        user.roleName,
                        user.userId,
                        user.fullName,
                        user.isApproved
                )
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {

        AppUser user = userRepository
                .findByEmail(request.email().trim().toLowerCase())
                .orElse(null);

        String message =
                "Nếu email tồn tại trong hệ thống, mã đặt lại mật khẩu đã được tạo. Trong bản triển khai thật, mã này cần được gửi qua email.";

        if (user == null) {
            return ResponseEntity.ok(
                    new ForgotPasswordResponse(message, null)
            );
        }

        String resetCode = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );

        user.passwordResetToken = resetCode;
        user.passwordResetExpiresAt = LocalDateTime.now().plusMinutes(15);

        userRepository.save(user);

        return ResponseEntity.ok(
                new ForgotPasswordResponse(message, resetCode)
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {

        AppUser user = userRepository
                .findByEmail(request.email().trim().toLowerCase())
                .orElse(null);

        if (user == null
                || user.passwordResetToken == null
                || !user.passwordResetToken.equals(request.resetCode().trim())) {
            return ResponseEntity.badRequest()
                    .body(ApiError.of("SE40006", "Mã đặt lại mật khẩu không hợp lệ"));
        }
        if (user.passwordResetExpiresAt == null
                || user.passwordResetExpiresAt.isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest()
                    .body(ApiError.of("SE40007", "Mã đặt lại mật khẩu đã hết hạn"));
        }

        user.passwordHash = passwordEncoder.encode(request.newPassword());
        user.passwordResetToken = null;
        user.passwordResetExpiresAt = null;

        userRepository.save(user);

        return ResponseEntity.ok(
                new ResetPasswordResponse(
                        "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới."
                )
        );
    }
}