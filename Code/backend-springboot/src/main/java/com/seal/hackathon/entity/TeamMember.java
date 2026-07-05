package com.seal.hackathon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "team_members", uniqueConstraints = @UniqueConstraint(columnNames = {"teamId", "userId"}))
public class TeamMember {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;
    @Column(nullable = false) public Integer teamId;
    @Column(nullable = false) public Integer userId;
    @Column(nullable = false, length = 30) public String memberRole = "Member";
    @Column(nullable = false) public LocalDateTime joinedAt = LocalDateTime.now();
}
