package com.seal.hackathon.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "team_join_requests")
public class TeamJoinRequest {

    // Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;

    // Đội mà người dùng muốn tham gia
    @Column(nullable = false)
    public Integer teamId;

    // Người gửi yêu cầu
    @Column(nullable = false)
    public Integer userId;

    // Trạng thái yêu cầu (PENDING / APPROVED / REJECTED / CANCELLED)
    @Column(nullable = false)
    public String status = "PENDING";

    // Thời điểm gửi yêu cầu
    public LocalDateTime createdAt = LocalDateTime.now();
}