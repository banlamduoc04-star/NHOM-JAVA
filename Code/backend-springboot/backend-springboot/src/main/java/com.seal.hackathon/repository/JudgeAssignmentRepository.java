package com.seal.hackathon.repository;

import com.seal.hackathon.entity.JudgeAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface JudgeAssignmentRepository extends JpaRepository<JudgeAssignment, Integer> {
    List<JudgeAssignment> findByRoundId(Integer roundId);
    List<JudgeAssignment> findByJudgeId(Integer judgeId);
    List<JudgeAssignment> findByRoundIdAndTrackId(Integer roundId, Integer trackId);
    boolean existsByRoundIdAndTrackIdAndJudgeId(Integer roundId, Integer trackId, Integer judgeId);
}
