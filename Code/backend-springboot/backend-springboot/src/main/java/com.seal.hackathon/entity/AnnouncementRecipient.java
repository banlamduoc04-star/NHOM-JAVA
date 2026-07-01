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
@Table(name = "announcement_recipients", uniqueConstraints = @UniqueConstraint(columnNames = {"announcementId", "userId"}))
public class AnnouncementRecipient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer announcementRecipientId;
    @Column(nullable = false) public Integer announcementId;
    @Column(nullable = false) public Integer userId;
    @Column(nullable = false) public Boolean isRead = false;
    public LocalDateTime readAt;
}