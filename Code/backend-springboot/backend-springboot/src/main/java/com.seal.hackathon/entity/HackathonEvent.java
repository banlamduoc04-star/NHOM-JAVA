package com.seal.hackathon.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "hackathon_events")
public class HackathonEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer eventId;
    @Column(nullable = false, length = 150) public String eventName;
    @Column(nullable = false, length = 30) public String season;
    @Column(nullable = false) public Integer eventYear;
    public LocalDate startDate;
    public LocalDate endDate;
    @Column(nullable = false, length = 30) public String status = "Draft";
    @Column(length = 2000) public String description;
    public Integer createdBy;
    @Column(nullable = false) public LocalDateTime createdAt = LocalDateTime.now();
}
