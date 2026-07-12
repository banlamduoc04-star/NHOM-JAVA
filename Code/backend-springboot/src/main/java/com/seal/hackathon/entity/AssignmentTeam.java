package com.seal.hackathon.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
name = "assignment_teams",
uniqueConstraints = @UniqueConstraint(
columnNames = {"assignmentId","teamId"}
)
)
public class AssignmentTeam {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
public Integer id;

@Column(nullable = false)
public Integer assignmentId;

@Column(nullable = false)
public Integer teamId;

}
