package com.seal.hackathon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "prizes")
public class Prize {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer prizeId;
    @Column(nullable = false)
    public Integer eventId;
    @Column(nullable = false)
    public Integer trackId;
    @Column(nullable = false, length = 150)
    public String prizeName;
    @Column(nullable = false)
    public Integer rankNo;
    @Column(length = 1000)
    public String description;
}
