package com.seal.hackathon.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "scores", uniqueConstraints = @UniqueConstraint(columnNames = {"submissionId", "judgeId", "criterionId"}))
public class Score {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer scoreId;
    @Column(nullable = false) public Integer submissionId;
    @Column(nullable = false) public Integer judgeId;
    @Column(nullable = false) public Integer criterionId;
    @Column(nullable = false, precision = 8, scale = 2) public BigDecimal scoreValue;
    @Column(length = 1000) public String comment;
    @Column(nullable = false) public LocalDateTime scoredAt = LocalDateTime.now();
}
