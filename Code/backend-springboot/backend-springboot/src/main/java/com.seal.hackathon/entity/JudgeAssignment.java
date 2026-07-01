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
@Table(name = "judge_assignments", uniqueConstraints = @UniqueConstraint(columnNames = {"roundId", "trackId", "judgeId"}))
public class JudgeAssignment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer assignmentId;
    @Column(nullable = false) public Integer roundId;
    @Column(nullable = false) public Integer trackId;
    @Column(nullable = false) public Integer judgeId;
    @Column(nullable = false) public LocalDateTime assignedAt = LocalDateTime.now();
}
