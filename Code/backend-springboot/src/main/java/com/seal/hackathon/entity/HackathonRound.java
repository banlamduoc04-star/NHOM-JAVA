package com.seal.hackathon.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "hackathon_rounds")
public class HackathonRound {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
public Integer roundId;

@Column(nullable = false)
public Integer eventId;

@Column(nullable = false, length = 150)
public String roundName;

@Column(nullable = false)
public Integer roundOrder;

public LocalDateTime submissionDeadline;

public Integer topNAdvance;

@Column(nullable = false, length = 30)
public String roundType = "Competition";

@Column(nullable = false)
public Boolean isCalibrationRound = false;

public LocalDateTime startTime;

public LocalDateTime endTime;

}
