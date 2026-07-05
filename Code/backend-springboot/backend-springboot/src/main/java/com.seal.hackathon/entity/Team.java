<<<<<<< Updated upstream
package com.seal.hackathon.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "teams")
public class Team {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer teamId;
    @Column(nullable = false) public Integer eventId;
    @Column(nullable = false) public Integer trackId;
    @Column(nullable = false, length = 150) public String teamName;
    @Column(nullable = false) public Integer leaderId;
    @Column(nullable = false, length = 30) public String status = "Pending";
    @Column(nullable = false) public LocalDateTime createdAt = LocalDateTime.now();
}
=======
>>>>>>> Stashed changes
