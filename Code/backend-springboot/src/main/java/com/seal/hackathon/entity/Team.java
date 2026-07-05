package com.seal.hackathon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "teams")
public class Team {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer teamId;
    @Column(nullable = false) public Integer eventId;
    @Column(nullable = false) public Integer trackId;
    @Column(nullable = false, length = 150) public String teamName;
    @Column(nullable = false) public Integer leaderId;
    @Column(nullable = false, length = 30) public String status = "Pending";
    @Column(nullable = false) public LocalDateTime createdAt = LocalDateTime.now();
}
