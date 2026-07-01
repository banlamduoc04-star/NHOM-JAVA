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
@Table(name = "team_prizes", uniqueConstraints = @UniqueConstraint(columnNames = {"teamId", "prizeId"}))
public class TeamPrize {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;
    @Column(nullable = false) public Integer teamId;
    @Column(nullable = false) public Integer prizeId;
    @Column(nullable = false) public LocalDateTime awardedAt = LocalDateTime.now();
}
