package com.seal.hackathon.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seal.hackathon.entity.AssignmentTeam;

public interface AssignmentTeamRepository
extends JpaRepository<AssignmentTeam, Integer> {
List<AssignmentTeam> findByAssignmentId(Integer assignmentId);
List<AssignmentTeam> findByTeamId(Integer teamId);
boolean existsByAssignmentIdAndTeamId(
        Integer assignmentId,
        Integer teamId
);
void deleteByAssignmentId(Integer assignmentId);
}
