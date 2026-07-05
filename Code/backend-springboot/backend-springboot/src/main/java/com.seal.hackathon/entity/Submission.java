package com.seal.hackathon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "submissions", uniqueConstraints = @UniqueConstraint(columnNames = {"teamId", "roundId"}))
public class Submission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer submissionId;
    @Column(nullable = false) public Integer teamId;
    @Column(nullable = false) public Integer roundId;
    @Column(length = 1000) public String repositoryUrl;
    @Column(length = 1000) public String demoUrl;
    @Column(length = 1000) public String reportUrl;
    @Column(nullable = false) public LocalDateTime submittedAt = LocalDateTime.now();
    @Column(nullable = false) public Boolean isEliminated = false;
    @Column(length = 1000) public String eliminationReason;
    public Integer eliminatedBy;
    public LocalDateTime eliminatedAt;
}
