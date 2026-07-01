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
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer announcementId;
    @Column(nullable = false) public Integer eventId;
    @Column(nullable = false) public Integer createdBy;
    public Integer trackId;
    @Column(nullable = false, length = 30) public String targetRole = "All";
    @Column(nullable = false, length = 200) public String title;
    @Column(nullable = false, length = 2000) public String content;
    @Column(nullable = false) public Boolean isPublished = true;
    @Column(nullable = false) public LocalDateTime createdAt = LocalDateTime.now();
}
