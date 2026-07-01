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
@Table(name = "round_results", uniqueConstraints = @UniqueConstraint(columnNames = {"roundId", "teamId"}))
public class RoundResult {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer roundResultId;
    @Column(nullable = false) public Integer roundId;
    @Column(nullable = false) public Integer trackId;
    @Column(nullable = false) public Integer teamId;
    @Column(nullable = false) public Integer submissionId;
    @Column(nullable = false) public Integer rankInTrack;
    @Column(nullable = false, precision = 10, scale = 2) public BigDecimal finalScore;
    @Column(nullable = false) public Boolean isAdvanced = false;
    @Column(nullable = false) public Boolean isEliminated = false;
    @Column(length = 1000) public String reason;
    @Column(nullable = false) public Integer evaluatedBy;
    @Column(nullable = false) public LocalDateTime evaluatedAt = LocalDateTime.now();
}
