package com.seal.hackathon.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record LoginResponse(String token, String email, String role, Integer userId, String fullName, Boolean isApproved) {}
    public record ForgotPasswordRequest(@Email @NotBlank String email) {}
    public record ForgotPasswordResponse(String message, String resetCodeForDemo) {}
    public record ResetPasswordRequest(
            @Email @NotBlank String email,
            @NotBlank String resetCode,
            @NotBlank @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự") String newPassword
    ) {}
    public record ResetPasswordResponse(String message) {}
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
            @NotBlank String password,
            @NotBlank String fullName,
            @NotBlank String roleName,
            String userType
    ) {}
    public record RejectUserRequest(String reason) {}
}
