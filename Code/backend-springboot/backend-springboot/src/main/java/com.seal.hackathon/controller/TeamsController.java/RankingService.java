package com.seal.hackathon.service;

import com.seal.hackathon.entity.*;
import com.seal.hackathon.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RankingService {
    private final SubmissionRepository submissions; private final TeamRepository teams; private final ScoreRepository scores; private final EventCriterionRepository criteria; private final HackathonRoundRepository rounds; private final RoundResultRepository results;

    public RankingService(SubmissionRepository submissions, TeamRepository teams, ScoreRepository scores, EventCriterionRepository criteria, HackathonRoundRepository rounds, RoundResultRepository results) {
        this.submissions=submissions; this.teams=teams; this.scores=scores; this.criteria=criteria; this.rounds=rounds; this.results=results;
    }

    public List<RankingItem> calculateRoundRanking(Integer roundId, Integer trackId) {
        List<Submission> subs = submissions.findByRoundId(roundId).stream().filter(s -> !Boolean.TRUE.equals(s.isEliminated)).toList();
        List<RankingItem> rows = new ArrayList<>();
        for (Submission sub : subs) {
            Team team = teams.findById(sub.teamId).orElse(null);
            if (team == null || (trackId != null && !trackId.equals(team.trackId))) continue;
            BigDecimal finalScore = calculateSubmissionFinalScore(sub);
            rows.add(new RankingItem(sub.submissionId, team.teamId, team.teamName, team.trackId, roundId, finalScore, 0));
        }
        Map<Integer, List<RankingItem>> byTrack = rows.stream().collect(Collectors.groupingBy(RankingItem::trackId));
        List<RankingItem> ranked = new ArrayList<>();
        for (List<RankingItem> group : byTrack.values()) {
            group.sort(Comparator.comparing(RankingItem::finalScore).reversed());
            int rank = 1;
            for (RankingItem item : group) ranked.add(item.withRank(rank++));
        }
        ranked.sort(Comparator.comparing(RankingItem::trackId).thenComparing(RankingItem::rankNo));
        return ranked;
    }

    public BigDecimal calculateSubmissionFinalScore(Submission sub) {
        Team team = teams.findById(sub.teamId).orElse(null);
        if (team == null) return BigDecimal.ZERO;
        List<EventCriterion> activeCriteria = criteria.findByEventIdAndIsActive(team.eventId, true);
        if (activeCriteria.isEmpty()) return BigDecimal.ZERO;
        Map<Integer, EventCriterion> criterionMap = activeCriteria.stream().collect(Collectors.toMap(c -> c.criterionId, c -> c));
        List<Score> subScores = scores.findBySubmissionId(sub.submissionId).stream().filter(s -> criterionMap.containsKey(s.criterionId)).toList();
        BigDecimal total = BigDecimal.ZERO;
        BigDecimal totalWeight = activeCriteria.stream().map(c -> c.weight).reduce(BigDecimal.ZERO, BigDecimal::add);
        for (EventCriterion c : activeCriteria) {
            List<Score> criterionScores = subScores.stream().filter(s -> c.criterionId.equals(s.criterionId)).toList();
            if (criterionScores.isEmpty()) continue;
            BigDecimal avg = criterionScores.stream().map(s -> s.scoreValue).reduce(BigDecimal.ZERO, BigDecimal::add).divide(BigDecimal.valueOf(criterionScores.size()), 4, RoundingMode.HALF_UP);
            total = total.add(avg.divide(c.maxScore, 4, RoundingMode.HALF_UP).multiply(c.weight).multiply(BigDecimal.TEN));
        }
        if (totalWeight.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return total.divide(totalWeight, 2, RoundingMode.HALF_UP);
    }

    public List<RoundResult> evaluateRound(Integer roundId, Integer evaluatedBy) {
        HackathonRound round = rounds.findById(roundId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vòng thi"));
        if (Boolean.TRUE.equals(round.isCalibrationRound)) throw new IllegalArgumentException("Calibration round cannot be used for advancement/elimination result");
        List<RankingItem> ranking = calculateRoundRanking(roundId, null);
        for (RankingItem item : ranking) {
            RoundResult rr = results.findByRoundIdAndTeamId(roundId, item.teamId()).orElseGet(RoundResult::new);
            rr.roundId = roundId;
            rr.trackId = item.trackId();
            rr.teamId = item.teamId();
            rr.submissionId = item.submissionId();
            rr.rankInTrack = item.rankNo();
            rr.finalScore = item.finalScore();
            rr.isAdvanced = round.topNAdvance != null && item.rankNo() <= round.topNAdvance;
            rr.isEliminated = false;
            rr.reason = rr.isAdvanced ? "Advanced by Top N rule" : "Not advanced by Top N rule";
            rr.evaluatedBy = evaluatedBy;
            rr.evaluatedAt = LocalDateTime.now();
            results.save(rr);
        }
        return results.findByRoundId(roundId);
    }

    public record RankingItem(Integer submissionId, Integer teamId, String teamName, Integer trackId, Integer roundId, BigDecimal finalScore, Integer rankNo) {
        public RankingItem withRank(Integer rank) { return new RankingItem(submissionId, teamId, teamName, trackId, roundId, finalScore, rank); }
    }
}
git á