package com.seal.hackathon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "tracks")
public class Track {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer trackId;
    @Column(nullable = false) public Integer eventId;
    @Column(nullable = false, length = 150) public String trackName;
    @Column(length = 1000) public String description;
}
