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
        name = "track_mentors",
        uniqueConstraints = @UniqueConstraint(columnNames = {"trackId", "mentorId"})
)
public class TrackMentor {

    // Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer trackMentorId;

    // Hạng mục (track) được phân công
    @Column(nullable = false)
    public Integer trackId;

    // Mentor được phân công cho hạng mục
    @Column(nullable = false)
    public Integer mentorId;

    // Thời điểm phân công
    @Column(nullable = false)
    public LocalDateTime assignedAt = LocalDateTime.now();
}