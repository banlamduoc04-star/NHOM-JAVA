package com.seal.hackathon.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tracks")
public class Track {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer trackId;
    @Column(nullable = false) public Integer eventId;
    @Column(nullable = false, length = 150) public String trackName;
    @Column(length = 1000) public String description;
}
