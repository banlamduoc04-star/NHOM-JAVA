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
@Table(name = "team_members", uniqueConstraints = @UniqueConstraint(columnNames = {"teamId", "userId"}))
public class TeamMember {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;
    @Column(nullable = false) public Integer teamId;
    @Column(nullable = false) public Integer userId;
    @Column(nullable = false, length = 30) public String memberRole = "Member";
    @Column(nullable = false) public LocalDateTime joinedAt = LocalDateTime.now();
}
