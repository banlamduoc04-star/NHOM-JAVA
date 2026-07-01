package com.seal.hackathon.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "prizes")
public class Prize {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer prizeId;
    @Column(nullable = false) public Integer eventId;
    @Column(nullable = false) public Integer trackId;
    @Column(nullable = false, length = 150) public String prizeName;
    @Column(nullable = false) public Integer rankNo;
    @Column(length = 1000) public String description;
}
