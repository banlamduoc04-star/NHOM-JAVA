package com.seal.hackathon.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seal.hackathon.entity.JudgeAssignment;

public interface JudgeAssignmentRepository
extends JpaRepository<JudgeAssignment, Integer> {
List<JudgeAssignment> findByRoundId(Integer roundId);
List<JudgeAssignment> findByJudgeId(Integer judgeId);
List<JudgeAssignment> findByJudgeIdAndRoundId(
        Integer judgeId,
        Integer roundId
);

List<JudgeAssignment> findByRoundIdAndTrackId(
        Integer roundId,
        Integer trackId
);

boolean existsByRoundIdAndTrackIdAndJudgeId(
        Integer roundId,
        Integer trackId,
        Integer judgeId
);

boolean existsByTrackId(
        Integer trackId
);

}
