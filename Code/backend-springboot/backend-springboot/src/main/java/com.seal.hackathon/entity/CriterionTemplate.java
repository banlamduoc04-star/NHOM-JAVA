package com.seal.hackathon.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "criterion_templates")
public class CriterionTemplate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer templateId;
    @Column(nullable = false, length = 150) public String templateName;
    @Column(length = 1000) public String description;
    @Column(nullable = false) public Boolean isActive = true;
}
