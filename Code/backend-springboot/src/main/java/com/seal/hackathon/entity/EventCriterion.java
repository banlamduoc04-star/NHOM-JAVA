package com.seal.hackathon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "event_criteria")
public class EventCriterion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer criterionId;
    @Column(nullable = false) public Integer eventId;
    @Column(nullable = false, length = 150) public String criterionName;
    @Column(nullable = false, precision = 8, scale = 2) public BigDecimal maxScore = BigDecimal.TEN;
    @Column(nullable = false, precision = 8, scale = 2) public BigDecimal weight = BigDecimal.ONE;
    @Column(nullable = false) public Boolean isActive = true;
}
