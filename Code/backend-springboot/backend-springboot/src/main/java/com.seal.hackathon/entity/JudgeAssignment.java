package com.seal.hackathon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "judge_assignments", uniqueConstraints = @UniqueConstraint(columnNames = {"roundId", "trackId", "judgeId"}))
public class JudgeAssignment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer assignmentId;
    @Column(nullable = false) public Integer roundId;
    @Column(nullable = false) public Integer trackId;
    @Column(nullable = false) public Integer judgeId;
    @Column(nullable = false) public LocalDateTime assignedAt = LocalDateTime.now();
}
