package com.seal.hackathon.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "announcements")
public class Announcement {

    // Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer announcementId;

    // Sự kiện và người tạo thông báo
    @Column(nullable = false)
    public Integer eventId;

    @Column(nullable = false)
    public Integer createdBy;

    // Track áp dụng (nếu có)
    public Integer trackId;

    // Nội dung thông báo
    @Column(nullable = false, length = 30)
    public String targetRole = "All";

    @Column(nullable = false, length = 200)
    public String title;

    @Column(nullable = false, length = 2000)
    public String content;

    @Column(nullable = false)
    public Boolean isPublished = true;

    // Thời điểm tạo thông báo
    @Column(nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();
}