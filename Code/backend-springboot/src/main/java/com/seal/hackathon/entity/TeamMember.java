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
@Table(
        name = "team_members",
        uniqueConstraints = @UniqueConstraint(columnNames = {"teamId", "userId"})
)
public class TeamMember {

    // Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;

    // Đội mà thành viên tham gia
    @Column(nullable = false)
    public Integer teamId;

    // Người dùng thuộc đội
    @Column(nullable = false)
    public Integer userId;

    // Vai trò trong đội (Leader / Member)
    @Column(nullable = false, length = 30)
    public String memberRole = "Member";

    // Thời điểm tham gia đội
    @Column(nullable = false)
    public LocalDateTime joinedAt = LocalDateTime.now();
}