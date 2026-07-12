package com.seal.hackathon.service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.springframework.stereotype.Service;

import com.seal.hackathon.entity.EventCriterion;
import com.seal.hackathon.entity.HackathonEvent;
import com.seal.hackathon.entity.HackathonRound;
import com.seal.hackathon.entity.Prize;
import com.seal.hackathon.entity.RoundResult;
import com.seal.hackathon.entity.Score;
import com.seal.hackathon.entity.Submission;
import com.seal.hackathon.entity.Team;
import com.seal.hackathon.entity.TeamPrize;
import com.seal.hackathon.entity.Track;
import com.seal.hackathon.repository.EventCriterionRepository;
import com.seal.hackathon.repository.HackathonEventRepository;
import com.seal.hackathon.repository.HackathonRoundRepository;
import com.seal.hackathon.repository.PrizeRepository;
import com.seal.hackathon.repository.RoundResultRepository;
import com.seal.hackathon.repository.ScoreRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.repository.TeamPrizeRepository;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.repository.TrackRepository;

@Service
public class RankingService {
    private final SubmissionRepository submissions;
    private final TeamRepository teams;
    private final ScoreRepository scores;
    private final EventCriterionRepository criteria;
    private final HackathonRoundRepository rounds;
    private final RoundResultRepository results;
    private final HackathonEventRepository events;
    private final TrackRepository tracks;
    private final PrizeRepository prizes;
    private final TeamPrizeRepository teamPrizes;

    public RankingService(
            SubmissionRepository submissions,
            TeamRepository teams,
            ScoreRepository scores,
            EventCriterionRepository criteria,
            HackathonRoundRepository rounds,
            RoundResultRepository results,
            HackathonEventRepository events,
            TrackRepository tracks,
            PrizeRepository prizes,
            TeamPrizeRepository teamPrizes
    ) {
        this.submissions = submissions;
        this.teams = teams;
        this.scores = scores;
        this.criteria = criteria;
        this.rounds = rounds;
        this.results = results;
        this.events = events;
        this.tracks = tracks;
        this.prizes = prizes;
        this.teamPrizes = teamPrizes;
    }

    public List<RankingItem> calculateRoundRanking(Integer roundId, Integer trackId) {
        HackathonRound round = rounds.findById(roundId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vòng thi"));
        List<Submission> subs = submissions.findByRoundId(roundId).stream()
                .filter(s -> !Boolean.TRUE.equals(s.isEliminated))
                .toList();
        List<RankingItem> rows = new ArrayList<>();
        for (Submission sub : subs) {
            Team team = teams.findById(sub.teamId).orElse(null);
            if (team == null || (trackId != null && !trackId.equals(team.trackId))) continue;
            BigDecimal averageScore = calculateSubmissionAverageScore(sub);
            BigDecimal finalScore = calculateSubmissionFinalScore(sub);
            rows.add(new RankingItem(
                    sub.submissionId,
                    team.teamId,
                    team.teamName,
                    team.trackId,
                    round.roundId,
                    averageScore,
                    finalScore,
                    0,
                    false,
                    false
            ));
        }
        Map<Integer, List<RankingItem>> byTrack = rows.stream().collect(Collectors.groupingBy(RankingItem::trackId));
        List<RankingItem> ranked = new ArrayList<>();
        for (List<RankingItem> group : byTrack.values()) {
            group.sort(Comparator.comparing(RankingItem::finalScore).reversed());
            int rank = 1;
            for (RankingItem item : group) {
                boolean isAdvanced = round.topNAdvance != null && rank <= round.topNAdvance;
                RoundResult publishedResult = results.findByRoundIdAndTeamId(round.roundId, item.teamId()).orElse(null);
                if (publishedResult == null) {
                    ranked.add(item.withRank(rank, isAdvanced, false));
                } else {
                    ranked.add(new RankingItem(
                            item.submissionId(),
                            item.teamId(),
                            item.teamName(),
                            item.trackId(),
                            item.roundId(),
                            item.averageScore(),
                            publishedResult.finalScore,
                            publishedResult.rankInTrack,
                            publishedResult.isAdvanced,
                            true
                    ));
                }
                rank++;
            }
        }
        ranked.sort(Comparator.comparing(RankingItem::trackId).thenComparing(RankingItem::rankNo));
        return ranked;
    }

    public List<RankingItem> getTeamsAdvance(Integer roundId, Integer trackId) {
        return calculateRoundRanking(roundId, trackId).stream()
                .filter(RankingItem::isAdvanced)
                .toList();
    }

    public BigDecimal calculateSubmissionAverageScore(Submission sub) {
        List<Score> subScores = scores.findBySubmissionId(sub.submissionId);
        if (subScores.isEmpty()) return BigDecimal.ZERO;
        return subScores.stream()
                .map(s -> s.scoreValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(subScores.size()), 2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateSubmissionFinalScore(Submission sub) {
        Team team = teams.findById(sub.teamId).orElse(null);
        if (team == null) return BigDecimal.ZERO;
        List<EventCriterion> activeCriteria = criteria.findByEventIdAndIsActive(team.eventId, true).stream()
                .filter(c -> c.trackId == null || c.trackId.equals(team.trackId))
                .filter(c -> c.roundId == null || c.roundId.equals(sub.roundId))
                .toList();
        if (activeCriteria.isEmpty()) return BigDecimal.ZERO;
        Map<Integer, EventCriterion> criterionMap = activeCriteria.stream().collect(Collectors.toMap(c -> c.criterionId, c -> c));
        List<Score> subScores = scores.findBySubmissionId(sub.submissionId).stream()
                .filter(s -> criterionMap.containsKey(s.criterionId))
                .toList();
        BigDecimal total = BigDecimal.ZERO;
        BigDecimal totalWeight = activeCriteria.stream().map(c -> c.weight).reduce(BigDecimal.ZERO, BigDecimal::add);
        for (EventCriterion c : activeCriteria) {
            List<Score> criterionScores = subScores.stream().filter(s -> c.criterionId.equals(s.criterionId)).toList();
            if (criterionScores.isEmpty()) continue;
            BigDecimal avg = criterionScores.stream()
                    .map(s -> s.scoreValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(criterionScores.size()), 4, RoundingMode.HALF_UP);
            total = total.add(avg.divide(c.maxScore, 4, RoundingMode.HALF_UP).multiply(c.weight).multiply(BigDecimal.TEN));
        }
        if (totalWeight.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return total.divide(totalWeight, 2, RoundingMode.HALF_UP);
    }

    public List<RoundResult> evaluateRound(Integer roundId, Integer evaluatedBy) {
        HackathonRound round = rounds.findById(roundId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vòng thi"));
        if (Boolean.TRUE.equals(round.isCalibrationRound)) throw new IllegalArgumentException("Calibration round cannot be used for advancement/elimination result");
        boolean finalRound = isFinalCompetitionRound(round);
        List<RankingItem> ranking = calculateRoundRanking(roundId, null);
        for (RankingItem item : ranking) {
            RoundResult rr = results.findByRoundIdAndTeamId(roundId, item.teamId()).orElseGet(RoundResult::new);
            rr.roundId = roundId;
            rr.trackId = item.trackId();
            rr.teamId = item.teamId();
            rr.submissionId = item.submissionId();
            rr.rankInTrack = item.rankNo();
            rr.finalScore = item.finalScore();
            boolean winner = finalRound && item.rankNo() == 1;
            rr.isAdvanced = !finalRound && item.isAdvanced();
            rr.isEliminated = !winner && !Boolean.TRUE.equals(rr.isAdvanced);
            rr.reason = winner
                    ? "Winner"
                    : (Boolean.TRUE.equals(rr.isAdvanced) ? "Qualified by Top N rule" : "Eliminated by ranking rule");
            rr.evaluatedBy = evaluatedBy;
            rr.evaluatedAt = LocalDateTime.now();
            results.save(rr);
        }
        return results.findByRoundId(roundId).stream()
                .sorted(Comparator.comparing((RoundResult r) -> r.trackId).thenComparing(r -> r.rankInTrack))
                .toList();
    }

    public List<ExportRow> exportRows(Integer eventId, Integer trackId, Integer roundId) {
        List<HackathonRound> targetRounds;
        if (roundId != null) {
            HackathonRound round = rounds.findById(roundId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vòng thi"));
            if (eventId != null && !eventId.equals(round.eventId)) throw new IllegalArgumentException("Vòng thi không thuộc sự kiện đã chọn");
            targetRounds = List.of(round);
        } else if (eventId != null) {
            targetRounds = rounds.findByEventIdOrderByRoundOrderAsc(eventId);
        } else {
            targetRounds = rounds.findAll();
        }

        Map<Integer, HackathonEvent> eventMap = events.findAll().stream().collect(Collectors.toMap(e -> e.eventId, e -> e));
        Map<Integer, Track> trackMap = tracks.findAll().stream().collect(Collectors.toMap(t -> t.trackId, t -> t));
        Map<Integer, Prize> prizeMap = prizes.findAll().stream().collect(Collectors.toMap(p -> p.prizeId, p -> p));
        Map<Integer, List<TeamPrize>> teamPrizeMap = teamPrizes.findAll().stream().collect(Collectors.groupingBy(tp -> tp.teamId));
        List<ExportRow> rows = new ArrayList<>();
        for (HackathonRound round : targetRounds) {
            if (eventId != null && !eventId.equals(round.eventId)) continue;
            HackathonEvent event = eventMap.get(round.eventId);
            for (RankingItem item : calculateRoundRanking(round.roundId, trackId)) {
                Track track = trackMap.get(item.trackId());
                Submission submission = submissions.findById(item.submissionId()).orElse(null);
                RoundResult publishedResult = results.findByRoundIdAndTeamId(round.roundId, item.teamId()).orElse(null);
                long judgeCount = scores.findBySubmissionId(item.submissionId()).stream()
                        .map(s -> s.judgeId)
                        .distinct()
                        .count();
                Integer rankNo = publishedResult == null ? item.rankNo() : publishedResult.rankInTrack;
                BigDecimal finalScore = publishedResult == null ? item.finalScore() : publishedResult.finalScore;
                Boolean isAdvanced = publishedResult == null ? item.isAdvanced() : publishedResult.isAdvanced;
                Boolean isPublished = publishedResult != null;
                String resultStatus = resultStatus(publishedResult);
                rows.add(new ExportRow(
                        round.eventId,
                        event == null ? "#" + round.eventId : event.eventName,
                        round.roundId,
                        round.roundName,
                        item.trackId(),
                        track == null ? "#" + item.trackId() : track.trackName,
                        item.teamId(),
                        item.teamName(),
                        item.submissionId(),
                        judgeCount,
                        item.averageScore(),
                        finalScore,
                        rankNo,
                        isAdvanced,
                        isPublished,
                        resultStatus,
                        submission == null ? List.of() : criterionScoreDetails(submission),
                        awardStatus(round, item, publishedResult, resultStatus, prizeMap, teamPrizeMap)
                ));
            }
        }
        return sortAndRankExportRows(rows);
    }

    public String exportCsv(Integer eventId, Integer trackId, Integer roundId) {
        StringBuilder sb = new StringBuilder("\uFEFF");
        sb.append("Rank,Team,Event,Category,Round,Total Score,Average Score\n");
        for (ExportRow r : exportRows(eventId, trackId, roundId)) {
            sb.append(r.rankNo()).append(',')
                    .append(csv(r.teamName())).append(',')
                    .append(csv(r.eventName())).append(',')
                    .append(csv(r.trackName())).append(',')
                    .append(csv(r.roundName())).append(',')
                    .append(r.finalScore()).append(',')
                    .append(r.averageScore()).append('\n');
        }
        return sb.toString();
    }

    public byte[] exportXlsx(Integer eventId, Integer trackId, Integer roundId) {
        List<ExportRow> rows = exportRows(eventId, trackId, roundId);
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            try (ZipOutputStream zip = new ZipOutputStream(out, StandardCharsets.UTF_8)) {
                put(zip, "[Content_Types].xml", """
                        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
                          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
                          <Default Extension="xml" ContentType="application/xml"/>
                          <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
                          <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
                          <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
                        </Types>
                        """);
                put(zip, "_rels/.rels", """
                        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
                        </Relationships>
                        """);
                put(zip, "xl/workbook.xml", """
                        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                        <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
                          <sheets><sheet name="Ranking Export" sheetId="1" r:id="rId1"/></sheets>
                        </workbook>
                        """);
                put(zip, "xl/_rels/workbook.xml.rels", """
                        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
                          <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
                        </Relationships>
                        """);
                put(zip, "xl/styles.xml", """
                        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                        <styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
                          <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
                          <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
                          <borders count="1"><border/></borders>
                          <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
                          <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
                        </styleSheet>
                        """);
                put(zip, "xl/worksheets/sheet1.xml", worksheetXml(rows));
            }
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Không thể tạo file Excel", e);
        }
    }

    private String worksheetXml(List<ExportRow> rows) {
        String[] headers = {"Rank", "Team", "Event", "Category", "Round", "Total Score", "Average Score"};
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>");
        sb.append("<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"><sheetData>");
        appendRow(sb, 1, Arrays.stream(headers).map(Object::toString).toList());
        int rowNo = 2;
        for (ExportRow r : rows) {
            appendRow(sb, rowNo++, List.of(
                    r.rankNo(), r.teamName(), r.eventName(), r.trackName(), r.roundName(), r.finalScore(), r.averageScore()
            ));
        }
        sb.append("</sheetData></worksheet>");
        return sb.toString();
    }

    private void appendRow(StringBuilder sb, int rowNo, List<?> cells) {
        sb.append("<row r=\"").append(rowNo).append("\">");
        for (int i = 0; i < cells.size(); i++) {
            String ref = columnName(i + 1) + rowNo;
            sb.append("<c r=\"").append(ref).append("\" t=\"inlineStr\"><is><t>")
                    .append(xml(cells.get(i)))
                    .append("</t></is></c>");
        }
        sb.append("</row>");
    }

    private String columnName(int index) {
        StringBuilder sb = new StringBuilder();
        while (index > 0) {
            int rem = (index - 1) % 26;
            sb.insert(0, (char) ('A' + rem));
            index = (index - 1) / 26;
        }
        return sb.toString();
    }

    private void put(ZipOutputStream zip, String name, String content) throws Exception {
        zip.putNextEntry(new ZipEntry(name));
        zip.write(content.stripLeading().getBytes(StandardCharsets.UTF_8));
        zip.closeEntry();
    }

    private List<ExportRow> sortAndRankExportRows(List<ExportRow> rows) {
        rows.sort(Comparator
                .comparing(ExportRow::finalScore, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(ExportRow::averageScore, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(ExportRow::teamName, Comparator.nullsLast(String::compareToIgnoreCase))
                .thenComparing(ExportRow::roundName, Comparator.nullsLast(String::compareToIgnoreCase)));
        return rows;
    }

    private String awardStatus(
            HackathonRound round,
            RankingItem item,
            RoundResult publishedResult,
            String resultStatus,
            Map<Integer, Prize> prizeMap,
            Map<Integer, List<TeamPrize>> teamPrizeMap
    ) {
        String awardedPrizes = teamPrizeMap.getOrDefault(item.teamId(), List.of()).stream()
                .map(tp -> prizeMap.get(tp.prizeId))
                .filter(Objects::nonNull)
                .filter(p -> Objects.equals(p.eventId, round.eventId) && Objects.equals(p.trackId, item.trackId()))
                .sorted(Comparator.comparing(p -> p.rankNo))
                .map(p -> p.prizeName)
                .collect(Collectors.joining(", "));
        if (!awardedPrizes.isBlank()) return awardedPrizes;
        if (publishedResult != null) return resultStatus;
        return "Chưa công bố";
    }

    private List<CriterionScoreDetail> criterionScoreDetails(Submission submission) {
        Team team = teams.findById(submission.teamId).orElse(null);
        if (team == null) return List.of();
        Map<Integer, List<Score>> byCriterion = scores.findBySubmissionId(submission.submissionId).stream()
                .collect(Collectors.groupingBy(score -> score.criterionId));
        return criteria.findByEventId(team.eventId).stream()
                .filter(c -> c.trackId == null || c.trackId.equals(team.trackId))
                .filter(c -> c.roundId == null || c.roundId.equals(submission.roundId))
                .filter(c -> Boolean.TRUE.equals(c.isActive) || byCriterion.containsKey(c.criterionId))
                .sorted(Comparator.comparing(c -> c.criterionId))
                .map(c -> {
                    List<Score> criterionScores = byCriterion.getOrDefault(c.criterionId, List.of());
                    BigDecimal average = criterionScores.isEmpty()
                            ? BigDecimal.ZERO
                            : criterionScores.stream()
                                    .map(score -> score.scoreValue)
                                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                                    .divide(BigDecimal.valueOf(criterionScores.size()), 2, RoundingMode.HALF_UP);
                    return new CriterionScoreDetail(
                            c.criterionId,
                            c.criterionName,
                            c.description,
                            c.maxScore,
                            c.weight,
                            average
                    );
                })
                .toList();
    }

    private String resultStatus(RoundResult result) {
        if (result == null) return "Not Published";
        if ("Winner".equalsIgnoreCase(result.reason)) return "Winner";
        return Boolean.TRUE.equals(result.isAdvanced) ? "Qualified" : "Eliminated";
    }

    private boolean isFinalCompetitionRound(HackathonRound round) {
        return rounds.findByEventIdOrderByRoundOrderAsc(round.eventId).stream()
                .filter(item -> !Boolean.TRUE.equals(item.isCalibrationRound))
                .noneMatch(item -> item.roundOrder != null && round.roundOrder != null && item.roundOrder > round.roundOrder);
    }

    private String csv(Object o) {
        if (o == null) return "";
        String s = String.valueOf(o).replace("\"", "\"\"");
        return "\"" + s + "\"";
    }

    private String xml(Object o) {
        if (o == null) return "";
        return String.valueOf(o)
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    public record RankingItem(
            Integer submissionId,
            Integer teamId,
            String teamName,
            Integer trackId,
            Integer roundId,
            BigDecimal averageScore,
            BigDecimal finalScore,
            Integer rankNo,
            Boolean isAdvanced,
            Boolean isPublished
    ) {
        public RankingItem withRank(Integer rank, Boolean isAdvanced, Boolean isPublished) {
            return new RankingItem(submissionId, teamId, teamName, trackId, roundId, averageScore, finalScore, rank, isAdvanced, isPublished);
        }
    }

    public record ExportRow(
            Integer eventId,
            String eventName,
            Integer roundId,
            String roundName,
            Integer trackId,
            String trackName,
            Integer teamId,
            String teamName,
            Integer submissionId,
            Long judgeCount,
            BigDecimal averageScore,
            BigDecimal finalScore,
            Integer rankNo,
            Boolean isAdvanced,
            Boolean isPublished,
            String resultStatus,
            List<CriterionScoreDetail> criterionScores,
            String awardStatus
    ) {}

    public record CriterionScoreDetail(
            Integer criterionId,
            String criterionName,
            String description,
            BigDecimal maxScore,
            BigDecimal weight,
            BigDecimal averageScore
    ) {}
}
