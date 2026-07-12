package com.seal.hackathon.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seal.hackathon.entity.Submission;

public interface SubmissionRepository extends JpaRepository<Submission, Integer> {
    List<Submission> findByRoundId(Integer roundId);
    List<Submission> findByTeamId(Integer teamId);
    List<Submission> findByRoundIdAndTeamId(Integer roundId, Integer teamId);
    Optional<Submission> findByTeamIdAndRoundId(Integer teamId, Integer roundId);
}
