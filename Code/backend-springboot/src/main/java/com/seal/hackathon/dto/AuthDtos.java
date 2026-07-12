package com.seal.hackathon.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO cho chức năng Authentication.
 */
public class AuthDtos {

    // Login
    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record LoginResponse(
            String token,
            Integer userId,
            String email,
            String fullName,
            String role,
            String roleName,
            Boolean approved,
            Boolean isApproved
    ) {}

    // Forgot Password
    public record ForgotPasswordRequest(
            @Email @NotBlank String email
    ) {}

    public record ForgotPasswordResponse(
            String message,
            String resetCodeForDemo
    ) {}

    public record ResetPasswordRequest(
            @Email @NotBlank String email,
            @NotBlank String resetCode,
            @NotBlank
            @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự")
            String newPassword
    ) {}

    public record ResetPasswordResponse(
            String message
    ) {}

    public record MessageResponse(
            String message
    ) {}

    // Register
    public record RegisterUserRequest(
            @Email @NotBlank String email,
            @NotBlank String password,
            @NotBlank String fullName,
            @NotBlank String studentType,
            String fptStudentCode,
            String externalStudentCode,
            String universityName
    ) {}

    public record CreateStaffAccountRequest(
            @Email @NotBlank String email,
            String password,
            @NotBlank String fullName,
            @NotBlank String roleName,
            String userType
    ) {}

    public record UpdateUserRequest(
            String fullName,
            String email,
            String password,
            String roleName,
            String userType
    ) {}

    // Admin
    public record RejectUserRequest(
            String reason
    ) {}
}