package com.seal.hackathon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "track_mentors", uniqueConstraints = @UniqueConstraint(columnNames = {"trackId", "mentorId"}))
public class TrackMentor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer trackMentorId;
    @Column(nullable = false) public Integer trackId;
    @Column(nullable = false) public Integer mentorId;
    @Column(nullable = false) public LocalDateTime assignedAt = LocalDateTime.now();
}
