package com.seal.hackathon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(
        name = "announcement_recipients",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"announcementId", "userId"}
        )
)
public class AnnouncementRecipient {

    // Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer announcementRecipientId;

    // Thông báo và người nhận
    @Column(nullable = false)
    public Integer announcementId;

    @Column(nullable = false)
    public Integer userId;

    // Trạng thái đã đọc
    @Column(nullable = false)
    public Boolean isRead = false;

    // Thời điểm đọc thông báo
    public LocalDateTime readAt;
}