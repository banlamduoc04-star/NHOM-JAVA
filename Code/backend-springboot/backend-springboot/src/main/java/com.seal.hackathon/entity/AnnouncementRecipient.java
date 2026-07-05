package com.seal.hackathon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

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
