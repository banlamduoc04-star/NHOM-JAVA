package com.seal.hackathon.repository;

import com.seal.hackathon.entity.RoundResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface RoundResultRepository extends JpaRepository<RoundResult, Integer> {
    List<RoundResult> findByRoundId(Integer roundId);
    List<RoundResult> findByTeamId(Integer teamId);
    List<RoundResult> findByRoundIdAndTrackIdOrderByRankInTrackAsc(Integer roundId, Integer trackId);
    Optional<RoundResult> findByRoundIdAndTeamId(Integer roundId, Integer teamId);
}
