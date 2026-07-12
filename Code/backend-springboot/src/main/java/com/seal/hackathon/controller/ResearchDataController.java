package com.seal.hackathon.controller;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;
import java.util.Comparator;
import java.util.DoubleSummaryStatistics;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seal.hackathon.entity.AppUser;
import com.seal.hackathon.entity.EventCriterion;
import com.seal.hackathon.entity.Score;
import com.seal.hackathon.entity.Team;
import com.seal.hackathon.repository.AppUserRepository;
import com.seal.hackathon.repository.EventCriterionRepository;
import com.seal.hackathon.repository.HackathonRoundRepository;
import com.seal.hackathon.repository.ScoreRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.repository.TrackRepository;

@RestController
@RequestMapping("/api/research")
@PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
public class ResearchDataController {
private final HackathonRoundRepository rounds;
private final TrackRepository tracks;
private final TeamRepository teams;
private final SubmissionRepository submissions;
private final ScoreRepository scores;
private final EventCriterionRepository criteria;
private final AppUserRepository users;

public ResearchDataController(
        HackathonRoundRepository rounds,
        TrackRepository tracks,
        TeamRepository teams,
        SubmissionRepository submissions,
        ScoreRepository scores,
        EventCriterionRepository criteria,
        AppUserRepository users
) {
    this.rounds = rounds;
    this.tracks = tracks;
    this.teams = teams;
    this.submissions = submissions;
    this.scores = scores;
    this.criteria = criteria;
    this.users = users;
}

@GetMapping("/event/{eventId}/judge-scores")
public List<Map<String, Object>> judgeScores(
        @PathVariable Integer eventId
) {
    Map<Integer, String> roundName = rounds
            .findByEventIdOrderByRoundOrderAsc(eventId)
            .stream()
            .collect(
                    Collectors.toMap(
                            r -> r.roundId,
                            r -> r.roundName
                    )
            );

    Map<Integer, String> trackName = tracks
            .findByEventId(eventId)
            .stream()
            .collect(
                    Collectors.toMap(
                            t -> t.trackId,
                            t -> t.trackName
                    )
            );

    Map<Integer, EventCriterion> cMap = criteria
            .findByEventId(eventId)
            .stream()
            .collect(
                    Collectors.toMap(
                            c -> c.criterionId,
                            c -> c
                    )
            );

    Map<Integer, AppUser> judgeMap = users
            .findAll()
            .stream()
            .collect(
                    Collectors.toMap(
                            u -> u.userId,
                            u -> u
                    )
            );

    List<Integer> teamIds = teams
            .findByEventId(eventId)
            .stream()
            .map(t -> t.teamId)
            .toList();

    return submissions.findAll()
            .stream()
            .filter(s -> teamIds.contains(s.teamId))
            .flatMap(
                    sub -> scores
                            .findBySubmissionId(sub.submissionId)
                            .stream()
                            .map(sc -> {
                                Team team = teams
                                        .findById(sub.teamId)
                                        .orElse(null);

                                EventCriterion c =
                                        cMap.get(sc.criterionId);

                                AppUser judge =
                                        judgeMap.get(sc.judgeId);

                                Map<String, Object> row =
                                        new LinkedHashMap<>();

                                row.put("eventId", eventId);
                                row.put("roundId", sub.roundId);
                                row.put(
                                        "roundName",
                                        roundName.get(sub.roundId)
                                );
                                row.put(
                                        "trackId",
                                        team == null
                                                ? null
                                                : team.trackId
                                );
                                row.put(
                                        "trackName",
                                        team == null
                                                ? null
                                                : trackName.get(team.trackId)
                                );
                                row.put(
                                        "submissionId",
                                        sub.submissionId
                                );
                                row.put(
                                        "anonymousTeamCode",
                                        "TEAM_" + sub.teamId
                                );
                                row.put(
                                        "anonymousJudgeCode",
                                        "JUDGE_" + sc.judgeId
                                );
                                row.put(
                                        "judgeType",
                                        judge == null
                                                ? "Unknown"
                                                : judge.roleName
                                );
                                row.put(
                                        "criterionId",
                                        sc.criterionId
                                );
                                row.put(
                                        "criterionName",
                                        c == null
                                                ? null
                                                : c.criterionName
                                );
                                row.put(
                                        "scoreValue",
                                        sc.scoreValue
                                );
                                row.put(
                                        "maxScore",
                                        c == null
                                                ? null
                                                : c.maxScore
                                );
                                row.put(
                                        "weight",
                                        c == null
                                                ? null
                                                : c.weight
                                );
                                row.put(
                                        "scoredAt",
                                        sc.scoredAt
                                );

                                return row;
                            })
            )
            .toList();
}

@GetMapping(value = "/event/{eventId}/judge-scores.csv")
public ResponseEntity<String> judgeScoresCsv(
        @PathVariable Integer eventId
) {
    StringBuilder sb = new StringBuilder(
            "\uFEFFeventId,roundId,roundName,trackId,trackName,"
                    + "anonymousTeamCode,anonymousJudgeCode,judgeType,"
                    + "criterionId,criterionName,scoreValue,maxScore,"
                    + "weight,scoredAt\n"
    );

    for (Map<String, Object> r : judgeScores(eventId)) {
        sb.append(r.get("eventId"))
                .append(',')
                .append(r.get("roundId"))
                .append(',')
                .append(csv(r.get("roundName")))
                .append(',')
                .append(r.get("trackId"))
                .append(',')
                .append(csv(r.get("trackName")))
                .append(',')
                .append(r.get("anonymousTeamCode"))
                .append(',')
                .append(r.get("anonymousJudgeCode"))
                .append(',')
                .append(r.get("judgeType"))
                .append(',')
                .append(r.get("criterionId"))
                .append(',')
                .append(csv(r.get("criterionName")))
                .append(',')
                .append(r.get("scoreValue"))
                .append(',')
                .append(r.get("maxScore"))
                .append(',')
                .append(r.get("weight"))
                .append(',')
                .append(r.get("scoredAt"))
                .append('\n');
    }

    return ResponseEntity.ok()
            .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=seal-rbl-event-"
                            + eventId
                            + ".csv"
            )
            .contentType(
                    MediaType.parseMediaType(
                            "text/csv; charset=UTF-8"
                    )
            )
            .body(sb.toString());
}

@GetMapping("/event/{eventId}/judge-variance")
public List<Map<String, Object>> judgeVariance(
        @PathVariable Integer eventId
) {
    return judgeScores(eventId)
            .stream()
            .collect(
                    Collectors.groupingBy(r -> unitKey(r))
            )
            .values()
            .stream()
            .map(rows -> {
                List<BigDecimal> vals = rows
                        .stream()
                        .map(
                                r -> (BigDecimal) r.get("scoreValue")
                        )
                        .toList();

                BigDecimal avg = vals
                        .stream()
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        )
                        .divide(
                                BigDecimal.valueOf(vals.size()),
                                4,
                                RoundingMode.HALF_UP
                        );

                BigDecimal min = vals
                        .stream()
                        .min(Comparator.naturalOrder())
                        .orElse(BigDecimal.ZERO);

                BigDecimal max = vals
                        .stream()
                        .max(Comparator.naturalOrder())
                        .orElse(BigDecimal.ZERO);

                BigDecimal variance = vals
                        .stream()
                        .map(
                                v -> v.subtract(avg)
                                        .multiply(v.subtract(avg))
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        )
                        .divide(
                                BigDecimal.valueOf(vals.size()),
                                4,
                                RoundingMode.HALF_UP
                        );

                Map<String, Object> m =
                        new LinkedHashMap<>(rows.get(0));

                m.put("judgeCount", vals.size());
                m.put("averageScore", avg);
                m.put("minScore", min);
                m.put("maxScore", max);
                m.put("scoreRange", max.subtract(min));
                m.put("scoreVariance", variance);

                return m;
            })
            .toList();
}

@GetMapping("/event/{eventId}/reliability-summary")
public Map<String, Object> reliabilitySummary(
        @PathVariable Integer eventId
) {
    List<Map<String, Object>> rows =
            judgeScores(eventId);

    Map<String, List<Map<String, Object>>> units = rows
            .stream()
            .collect(
                    Collectors.groupingBy(this::unitKey)
            );

    Map<String, Object> result = new LinkedHashMap<>();

    result.put("eventId", eventId);
    result.put(
            "overall",
            reliabilityMetrics(units.values())
    );
    result.put(
            "byCriterion",
            criterionReliability(rows)
    );
    result.put(
            "judgeTypeAverageScores",
            judgeTypeAverageScores(rows)
    );
    result.put(
            "judgeTypeScoreGap",
            judgeTypeScoreGap(rows)
    );
    result.put(
            "note",
            "ICC và Krippendorff alpha trong hệ thống được tính "
                    + "xấp xỉ cho dữ liệu demo/unbalanced. Khi viết "
                    + "báo cáo nghiên cứu chính thức, nên xuất CSV "
                    + "và tính lại bằng R/Python để kiểm định thống "
                    + "kê đầy đủ."
    );

    return result;
}

@GetMapping("/round/{roundId}/calibration-distribution")
public Map<String, Object> calibrationDistribution(
        @PathVariable Integer roundId
) {
    List<Score> list = scores.findByRoundId(roundId);

    Map<Integer, DoubleSummaryStatistics> byCriterion = list
            .stream()
            .collect(
                    Collectors.groupingBy(
                            s -> s.criterionId,
                            Collectors.summarizingDouble(
                                    s -> s.scoreValue.doubleValue()
                            )
                    )
            );

    Map<String, Object> res = new LinkedHashMap<>();

    res.put("roundId", roundId);
    res.put("distributionByCriterion", byCriterion);

    return res;
}

private List<Map<String, Object>> criterionReliability(
        List<Map<String, Object>> rows
) {
    return rows.stream()
            .collect(
                    Collectors.groupingBy(
                            r -> String.valueOf(r.get("criterionId"))
                                    + "|"
                                    + String.valueOf(
                                            r.get("criterionName")
                                    )
                    )
            )
            .entrySet()
            .stream()
            .map(entry -> {
                List<Map<String, Object>> criterionRows =
                        entry.getValue();

                Map<String, List<Map<String, Object>>> units =
                        criterionRows
                                .stream()
                                .collect(
                                        Collectors.groupingBy(
                                                this::unitKey
                                        )
                                );

                Map<String, Object> metrics =
                        reliabilityMetrics(units.values());

                Map<String, Object> first =
                        criterionRows.get(0);

                Map<String, Object> out =
                        new LinkedHashMap<>();

                out.put(
                        "criterionId",
                        first.get("criterionId")
                );
                out.put(
                        "criterionName",
                        first.get("criterionName")
                );
                out.putAll(metrics);

                return out;
            })
            .sorted(
                    Comparator.comparing(
                            m -> String.valueOf(
                                    m.get("criterionName")
                            )
                    )
            )
            .toList();
}

private List<Map<String, Object>> judgeTypeAverageScores(
        List<Map<String, Object>> rows
) {
    return rows.stream()
            .collect(
                    Collectors.groupingBy(
                            r -> String.valueOf(r.get("judgeType"))
                    )
            )
            .entrySet()
            .stream()
            .map(entry -> {
                List<Double> vals =
                        values(entry.getValue());

                Map<String, Object> out =
                        new LinkedHashMap<>();

                out.put("judgeType", entry.getKey());
                out.put("scoreCount", vals.size());
                out.put("averageScore", round(avg(vals)));

                return out;
            })
            .sorted(
                    Comparator.comparing(
                            m -> String.valueOf(
                                    m.get("judgeType")
                            )
                    )
            )
            .toList();
}

private Double judgeTypeScoreGap(
        List<Map<String, Object>> rows
) {
    List<Double> gaps = rows
            .stream()
            .collect(
                    Collectors.groupingBy(this::unitKey)
            )
            .values()
            .stream()
            .map(unitRows -> {
                List<Double> internal = values(
                        unitRows
                                .stream()
                                .filter(
                                        r -> "Judge".equals(
                                                r.get("judgeType")
                                        )
                                )
                                .toList()
                );

                List<Double> guest = values(
                        unitRows
                                .stream()
                                .filter(
                                        r -> "GuestJudge".equals(
                                                r.get("judgeType")
                                        )
                                )
                                .toList()
                );

                if (internal.isEmpty() || guest.isEmpty()) {
                    return null;
                }

                return Math.abs(
                        avg(internal) - avg(guest)
                );
            })
            .filter(Objects::nonNull)
            .toList();

    return gaps.isEmpty()
            ? null
            : round(avg(gaps));
}

private Map<String, Object> reliabilityMetrics(
        Collection<List<Map<String, Object>>> groupedUnits
) {
    List<List<Map<String, Object>>> eligible = groupedUnits
            .stream()
            .filter(rows -> rows.size() >= 2)
            .toList();

    Map<String, Object> out = new LinkedHashMap<>();

    int unitCount = eligible.size();

    int ratingCount = eligible
            .stream()
            .mapToInt(List::size)
            .sum();

    out.put("eligibleUnitCount", unitCount);
    out.put("ratingCount", ratingCount);

    out.put(
            "averageJudgePerUnit",
            unitCount == 0
                    ? 0
                    : round(
                            ratingCount / (double) unitCount
                    )
    );

    if (unitCount < 2 || ratingCount <= unitCount) {
        out.put("iccOneWayApprox", null);
        out.put("krippendorffAlphaApprox", null);
        out.put("averageVariance", null);
        out.put("averageRange", null);
        out.put(
                "interpretation",
                "Chưa đủ dữ liệu: cần ít nhất 2 bài/tiêu chí "
                        + "và mỗi bài cần ít nhất 2 giám khảo chấm."
        );

        return out;
    }

    List<Double> all = eligible
            .stream()
            .flatMap(rows -> values(rows).stream())
            .toList();

    double grandMean = avg(all);
    double withinSse = 0.0;
    double betweenWeighted = 0.0;
    double rangeSum = 0.0;
    double varianceSum = 0.0;

    for (List<Map<String, Object>> unitRows : eligible) {
        List<Double> vals = values(unitRows);

        double unitMean = avg(vals);

        withinSse += vals
                .stream()
                .mapToDouble(
                        v -> Math.pow(v - unitMean, 2)
                )
                .sum();

        betweenWeighted += vals.size()
                * Math.pow(unitMean - grandMean, 2);

        rangeSum += vals
                .stream()
                .mapToDouble(Double::doubleValue)
                .max()
                .orElse(0)
                - vals.stream()
                        .mapToDouble(Double::doubleValue)
                        .min()
                        .orElse(0);

        varianceSum += variance(vals);
    }

    double msBetween =
            betweenWeighted / (unitCount - 1.0);

    double msWithin =
            withinSse / (ratingCount - unitCount);

    double kAverage =
            ratingCount / (double) unitCount;

    Double icc = null;

    double denominator =
            msBetween + (kAverage - 1.0) * msWithin;

    if (Math.abs(denominator) > 0.0000001) {
        icc = (msBetween - msWithin) / denominator;
    }

    Double alpha = null;

    double totalSse = all
            .stream()
            .mapToDouble(
                    v -> Math.pow(v - grandMean, 2)
            )
            .sum();

    double observedDisagreement =
            withinSse / (ratingCount - unitCount);

    double expectedDisagreement =
            totalSse / (ratingCount - 1.0);

    if (expectedDisagreement > 0.0000001) {
        alpha = 1.0
                - (observedDisagreement
                / expectedDisagreement);
    }

    out.put("iccOneWayApprox", round(icc));
    out.put("krippendorffAlphaApprox", round(alpha));
    out.put(
            "averageVariance",
            round(varianceSum / unitCount)
    );
    out.put(
            "averageRange",
            round(rangeSum / unitCount)
    );
    out.put(
            "interpretation",
            interpretReliability(icc, alpha)
    );

    return out;
}

private String interpretReliability(
        Double icc,
        Double alpha
) {
    Double value = icc != null ? icc : alpha;

    if (value == null) {
        return "Chưa đủ dữ liệu để diễn giải độ tin cậy.";
    }

    if (value >= 0.75) {
        return "Mức nhất quán tốt; có thể dùng để bảo vệ "
                + "tính công bằng tương đối của chấm điểm.";
    }

    if (value >= 0.50) {
        return "Mức nhất quán trung bình; nên có vòng hiệu chuẩn "
                + "và thảo luận rubric trước khi chấm chính thức.";
    }

    return "Mức nhất quán thấp; cần rà soát rubric, "
            + "huấn luyện giám khảo hoặc tăng số giám khảo "
            + "trên mỗi bài.";
}

private String unitKey(
        Map<String, Object> r
) {
    return r.get("roundId")
            + "|"
            + r.get("trackId")
            + "|"
            + r.get("submissionId")
            + "|"
            + r.get("criterionId");
}

private List<Double> values(
        List<Map<String, Object>> rows
) {
    return rows.stream()
            .map(r -> r.get("scoreValue"))
            .filter(Objects::nonNull)
            .map(
                    v -> ((BigDecimal) v).doubleValue()
            )
            .toList();
}

private double avg(
        List<Double> vals
) {
    if (vals == null || vals.isEmpty()) {
        return 0.0;
    }

    return vals.stream()
            .mapToDouble(Double::doubleValue)
            .average()
            .orElse(0.0);
}

private double variance(
        List<Double> vals
) {
    if (vals == null || vals.isEmpty()) {
        return 0.0;
    }

    double mean = avg(vals);

    return vals.stream()
            .mapToDouble(
                    v -> Math.pow(v - mean, 2)
            )
            .average()
            .orElse(0.0);
}

private Double round(
        Double value
) {
    if (value == null
            || value.isNaN()
            || value.isInfinite()) {
        return null;
    }

    return BigDecimal.valueOf(value)
            .setScale(4, RoundingMode.HALF_UP)
            .doubleValue();
}

private String csv(
        Object o
) {
    if (o == null) {
        return "";
    }

    String s = String.valueOf(o)
            .replace("\"", "\"\"");

    return "\"" + s + "\"";
}
}
