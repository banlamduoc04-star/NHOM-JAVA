package com.seal.hackathon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "team_prizes", uniqueConstraints = @UniqueConstraint(columnNames = {"teamId", "prizeId"}))
public class TeamPrize {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;
    @Column(nullable = false) public Integer teamId;
    @Column(nullable = false) public Integer prizeId;
    @Column(nullable = false) public LocalDateTime awardedAt = LocalDateTime.now();
}
