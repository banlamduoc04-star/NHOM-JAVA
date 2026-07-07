package com.seal.hackathon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(
        name = "app_users",
        uniqueConstraints = @UniqueConstraint(columnNames = "email")
)
public class AppUser {

    // Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer userId;

    // Basic Information
    @Column(nullable = false, length = 100)
    public String fullName;

    @Column(nullable = false, length = 255)
    public String email;

    @Column(nullable = false, length = 255)
    public String passwordHash;

    @Column(nullable = false, length = 30)
    public String roleName = "TeamMember";

    @Column(nullable = false, length = 30)
    public String userType = "Student";

    @Column(nullable = false)
    public Boolean isApproved = false;

    // Student Information
    @Column(length = 30)
    public String fptStudentCode;

    @Column(length = 30)
    public String externalStudentCode;

    @Column(length = 200)
    public String universityName;

    // Password Reset
    @Column(length = 120)
    public String passwordResetToken;

    public LocalDateTime passwordResetExpiresAt;

    // Audit Information
    @Column(nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();
}