package com.seal.hackathon.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.seal.hackathon.entity.Score;

public interface ScoreRepository extends JpaRepository<Score, Integer> {
    List<Score> findBySubmissionId(Integer submissionId);
    List<Score> findByJudgeId(Integer judgeId);
    Optional<Score> findBySubmissionIdAndJudgeIdAndCriterionId(Integer submissionId, Integer judgeId, Integer criterionId);
    @Query("select s from Score s join Submission sub on sub.submissionId=s.submissionId where sub.teamId = :teamId")
    List<Score> findByTeamId(Integer teamId);
    @Query("select s from Score s join Submission sub on sub.submissionId=s.submissionId where sub.roundId = :roundId")
    List<Score> findByRoundId(Integer roundId);
    boolean existsByCriterionId(Integer criterionId);
}
