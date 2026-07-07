package com.seal.hackathon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "announcements")
public class Announcement {

    // Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer announcementId;

    // Event Information
    @Column(nullable = false)
    public Integer eventId;

    @Column(nullable = false)
    public Integer createdBy;

    public Integer trackId;

    // Announcement Information
    @Column(nullable = false, length = 30)
    public String targetRole = "All";

    @Column(nullable = false, length = 200)
    public String title;

    @Column(nullable = false, length = 2000)
    public String content;

    @Column(nullable = false)
    public Boolean isPublished = true;

    // Audit Information
    @Column(nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();
}