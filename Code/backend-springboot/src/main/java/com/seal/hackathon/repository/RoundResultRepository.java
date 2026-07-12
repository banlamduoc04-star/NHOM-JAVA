package com.seal.hackathon.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seal.hackathon.entity.RoundResult;

public interface RoundResultRepository extends JpaRepository<RoundResult, Integer> {
    List<RoundResult> findByRoundId(Integer roundId);
    List<RoundResult> findByTeamId(Integer teamId);
    List<RoundResult> findByRoundIdAndTrackIdOrderByRankInTrackAsc(Integer roundId, Integer trackId);
    Optional<RoundResult> findByRoundIdAndTeamId(Integer roundId, Integer teamId);
}
