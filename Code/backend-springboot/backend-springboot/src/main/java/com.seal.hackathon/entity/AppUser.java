package com.seal.hackathon.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "app_users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer userId;
    @Column(nullable = false, length = 100) public String fullName;
    @Column(nullable = false, length = 255) public String email;
    @Column(nullable = false, length = 255) public String passwordHash;
    @Column(nullable = false, length = 30) public String roleName = "TeamMember";
    @Column(nullable = false, length = 30) public String userType = "Student";
    @Column(nullable = false) public Boolean isApproved = false;
    @Column(length = 30) public String fptStudentCode;
    @Column(length = 30) public String externalStudentCode;
    @Column(length = 200) public String universityName;
    @Column(length = 120) public String passwordResetToken;
    public LocalDateTime passwordResetExpiresAt;
    @Column(nullable = false) public LocalDateTime createdAt = LocalDateTime.now();
}
