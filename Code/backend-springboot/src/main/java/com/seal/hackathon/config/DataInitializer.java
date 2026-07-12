package com.seal.hackathon.config;

import com.seal.hackathon.entity.*;
import com.seal.hackathon.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;


@Configuration
public class DataInitializer {

    @Bean
    @Order(1)
    CommandLineRunner seed(
            AppUserRepository users,
            HackathonEventRepository events,
            TrackRepository tracks,
            HackathonRoundRepository rounds,
            TeamRepository teams,
            TeamMemberRepository members,
            SubmissionRepository submissions,
            EventCriterionRepository eventCriteria,
            CriterionTemplateRepository templates,
            CriterionTemplateItemRepository templateItems,
            JudgeAssignmentRepository assignments,
            ScoreRepository scores,
            PrizeRepository prizes,
            AnnouncementRepository announcements,
            AuditLogRepository auditLogs,
            PasswordEncoder encoder
    ) {

        return args -> {

            AppUser coordinator = user(
                    users,
                    encoder,
                    "Điều phối viên SEAL",
                    "coordinator@seal.edu.vn",
                    "EventCoordinator",
                    "Staff",
                    true,
                    null,
                    null,
                    null
            );


            AppUser mentor = user(
                    users,
                    encoder,
                    "Mentor Nguyễn Minh",
                    "mentor@seal.edu.vn",
                    "Mentor",
                    "Staff",
                    true,
                    null,
                    null,
                    null
            );


            AppUser judge = user(
                    users,
                    encoder,
                    "Giám khảo Trần Anh",
                    "judge@seal.edu.vn",
                    "Judge",
                    "Staff",
                    true,
                    null,
                    null,
                    null
            );


            AppUser guestJudge = user(
                    users,
                    encoder,
                    "Giám khảo khách mời Lê Hà",
                    "guestjudge@seal.edu.vn",
                    "GuestJudge",
                    "Staff",
                    true,
                    null,
                    null,
                    null
            );


            AppUser student1 = user(
                    users,
                    encoder,
                    "Nguyễn Văn A",
                    "leader1@seal.edu.vn",
                    "TeamMember",
                    "Student",
                    true,
                    "SE170001",
                    null,
                    null
            );


            AppUser student2 = user(
                    users,
                    encoder,
                    "Trần Thị B",
                    "member2@seal.edu.vn",
                    "TeamMember",
                    "Student",
                    true,
                    "SE170002",
                    null,
                    null
            );


            AppUser student3 = user(
                    users,
                    encoder,
                    "Lê Văn C",
                    "member3@seal.edu.vn",
                    "TeamMember",
                    "Student",
                    true,
                    "SE170003",
                    null,
                    null
            );


            AppUser student4 = user(
                    users,
                    encoder,
                    "Phạm Quốc D",
                    "partner1@seal.edu.vn",
                    "TeamMember",
                    "Student",
                    true,
                    null,
                    "HCMUT001",
                    "Trường Đại học Bách khoa TP.HCM"
            );


            user(
                    users,
                    encoder,
                    "Sinh viên chờ duyệt",
                    "pending@seal.edu.vn",
                    "TeamMember",
                    "Student",
                    false,
                    "SE170099",
                    null,
                    null
            );


            // Tài khoản demo khớp với FE cũ để dễ đăng nhập khi test.
            // Mật khẩu chung: 123456.

            user(
                    users,
                    encoder,
                    "Event Coordinator",
                    "admin@seal.com",
                    "EventCoordinator",
                    "Staff",
                    true,
                    null,
                    null,
                    null
            );


            user(
                    users,
                    encoder,
                    "Mentor User",
                    "mentor@seal.com",
                    "Mentor",
                    "Staff",
                    true,
                    null,
                    null,
                    null
            );


            user(
                    users,
                    encoder,
                    "Judge User",
                    "judge@seal.com",
                    "Judge",
                    "Staff",
                    true,
                    null,
                    null,
                    null
            );


            user(
                    users,
                    encoder,
                    "Team Member",
                    "member@seal.com",
                    "TeamMember",
                    "Student",
                    true,
                    "SE170004",
                    null,
                    null
            );
            if (templates.count() == 0) {

                CriterionTemplate t = new CriterionTemplate();

                t.templateName = "Mẫu tiêu chí SEAL mặc định";
                t.description =
                        "Mẫu tiêu chí chấm điểm dùng lại cho các sự kiện SEAL Hackathon.";

                templates.save(t);


                addTemplateItem(
                        templateItems,
                        t.templateId,
                        "Hiện thực kỹ thuật",
                        "10",
                        "0.35",
                        1
                );

                addTemplateItem(
                        templateItems,
                        t.templateId,
                        "Tính sáng tạo",
                        "10",
                        "0.20",
                        2
                );

                addTemplateItem(
                        templateItems,
                        t.templateId,
                        "UI/UX và độ phù hợp sản phẩm",
                        "10",
                        "0.20",
                        3
                );

                addTemplateItem(
                        templateItems,
                        t.templateId,
                        "Thuyết trình",
                        "10",
                        "0.15",
                        4
                );

                addTemplateItem(
                        templateItems,
                        t.templateId,
                        "Tính khả thi",
                        "10",
                        "0.10",
                        5
                );
            }


            if (events.count() == 0) {

                HackathonEvent event = new HackathonEvent();

                event.eventName = "SEAL Summer 2026";
                event.season = "Summer";
                event.eventYear = 2026;
                event.startDate = LocalDate.of(2026, 7, 1);
                event.endDate = LocalDate.of(2026, 7, 31);
                event.status = "Open";
                event.description =
                        "Cuộc thi hackathon học thuật ngành Kỹ thuật Phần mềm do Khoa SE phối hợp với PDP tổ chức.";
                event.createdBy = coordinator.userId;

                events.save(event);


                Track web = track(
                        tracks,
                        event.eventId,
                        "Ứng dụng Web",
                        "Sản phẩm web/software engineering có repository, demo và báo cáo kỹ thuật."
                );


                Track ai = track(
                        tracks,
                        event.eventId,
                        "AI hỗ trợ giáo dục",
                        "Giải pháp ứng dụng AI để hỗ trợ học tập, định hướng nghề nghiệp hoặc đánh giá năng lực."
                );


                HackathonRound calibration = round(
                        rounds,
                        event.eventId,
                        "Vòng hiệu chuẩn giám khảo",
                        0,
                        LocalDateTime.of(2026, 7, 5, 23, 59),
                        0,
                        "Calibration",
                        true
                );


                HackathonRound preliminary = round(
                        rounds,
                        event.eventId,
                        "Vòng sơ khảo",
                        1,
                        LocalDateTime.of(2026, 7, 15, 23, 59),
                        5,
                        "Competition",
                        false
                );


                round(
                        rounds,
                        event.eventId,
                        "Vòng chung kết",
                        2,
                        LocalDateTime.of(2026, 7, 25, 23, 59),
                        3,
                        "Competition",
                        false
                );


                criterion(
                        eventCriteria,
                        event.eventId,
                        "Hiện thực kỹ thuật",
                        "10",
                        "0.35"
                );

                criterion(
                        eventCriteria,
                        event.eventId,
                        "Tính sáng tạo",
                        "10",
                        "0.20"
                );

                criterion(
                        eventCriteria,
                        event.eventId,
                        "UI/UX và độ phù hợp sản phẩm",
                        "10",
                        "0.20"
                );

                criterion(
                        eventCriteria,
                        event.eventId,
                        "Thuyết trình",
                        "10",
                        "0.15"
                );

                criterion(
                        eventCriteria,
                        event.eventId,
                        "Tính khả thi",
                        "10",
                        "0.10"
                );


                Team team = team(
                        teams,
                        event.eventId,
                        web.trackId,
                        "SEAL Builders",
                        student1.userId,
                        "Approved"
                );


                member(
                        members,
                        team.teamId,
                        student1.userId,
                        "Leader"
                );

                member(
                        members,
                        team.teamId,
                        student2.userId,
                        "Member"
                );

                member(
                        members,
                        team.teamId,
                        student3.userId,
                        "Member"
                );

                member(
                        members,
                        team.teamId,
                        student4.userId,
                        "Member"
                );


                Team team2 = team(
                        teams,
                        event.eventId,
                        ai.trackId,
                        "Agile Coders",
                        student4.userId,
                        "Pending"
                );


                member(
                        members,
                        team2.teamId,
                        student4.userId,
                        "Leader"
                );

                member(
                        members,
                        team2.teamId,
                        student1.userId,
                        "Member"
                );

                member(
                        members,
                        team2.teamId,
                        student2.userId,
                        "Member"
                );
                assign(
                        assignments,
                        preliminary.roundId,
                        web.trackId,
                        judge.userId
                );

                assign(
                        assignments,
                        preliminary.roundId,
                        web.trackId,
                        guestJudge.userId
                );

                assign(
                        assignments,
                        calibration.roundId,
                        web.trackId,
                        judge.userId
                );


                Submission sub = new Submission();

                sub.teamId = team.teamId;
                sub.roundId = preliminary.roundId;
                sub.repositoryUrl =
                        "https://github.com/seal-demo/seal-builders";
                sub.demoUrl =
                        "https://seal-demo.example.com";
                sub.reportUrl =
                        "https://drive.google.com/seal-builders-report";

                submissions.save(sub);


                for (EventCriterion c :
                        eventCriteria.findByEventId(event.eventId)) {

                    score(
                            scores,
                            sub.submissionId,
                            judge.userId,
                            c.criterionId,
                            c.criterionName.contains("kỹ thuật")
                                    ? "8.50"
                                    : "8.00",
                            "Đáp ứng tốt yêu cầu tiêu chí."
                    );


                    score(
                            scores,
                            sub.submissionId,
                            guestJudge.userId,
                            c.criterionId,
                            c.criterionName.contains("sáng tạo")
                                    ? "9.00"
                                    : "8.20",
                            "Có tiềm năng phát triển tiếp."
                    );
                }


                prize(
                        prizes,
                        event.eventId,
                        web.trackId,
                        "Giải Nhất",
                        1,
                        "Trao cho đội đứng hạng 1 của hạng mục."
                );

                prize(
                        prizes,
                        event.eventId,
                        web.trackId,
                        "Giải Nhì",
                        2,
                        "Trao cho đội đứng hạng 2 của hạng mục."
                );

                prize(
                        prizes,
                        event.eventId,
                        ai.trackId,
                        "Giải Ý tưởng AI",
                        1,
                        "Trao cho giải pháp AI có tính ứng dụng cao."
                );


                Announcement ann = new Announcement();

                ann.eventId = event.eventId;
                ann.trackId = null;
                ann.createdBy = coordinator.userId;
                ann.targetRole = "All";
                ann.title = "SEAL Summer 2026 mở cổng đăng ký";
                ann.content =
                        "Các đội vui lòng hoàn tất đăng ký, chọn hạng mục và theo dõi hạn nộp bài trong từng vòng thi.";
                ann.isPublished = true;

                announcements.save(ann);


                AuditLog log = new AuditLog();

                log.userId = coordinator.userId;
                log.actionName = "KHỞI_TẠO_DỮ_LIỆU_DEMO";
                log.entityName = "HackathonEvent";
                log.entityId = event.eventId;
                log.newValue = "SEAL Summer 2026";

                auditLogs.save(log);
            }


            normalizeDemoVietnameseText(
                    users,
                    events,
                    tracks,
                    rounds,
                    eventCriteria,
                    templates,
                    templateItems,
                    prizes,
                    announcements,
                    auditLogs,
                    scores
            );
        };
    }
    private AppUser user(
            AppUserRepository repo,
            PasswordEncoder encoder,
            String name,
            String email,
            String role,
            String userType,
            boolean approved,
            String fptCode,
            String externalCode,
            String university
    ) {

        return repo.findByEmail(email)
                .map(existing -> {

                    boolean changed = false;


                    if (!Objects.equals(existing.fullName, name)) {
                        existing.fullName = name;
                        changed = true;
                    }


                    if (!Objects.equals(existing.roleName, role)) {
                        existing.roleName = role;
                        changed = true;
                    }


                    if (!Objects.equals(existing.userType, userType)) {
                        existing.userType = userType;
                        changed = true;
                    }


                    if (!Objects.equals(existing.isApproved, approved)) {
                        existing.isApproved = approved;
                        changed = true;
                    }


                    String expectedStatus =
                            approved
                                    ? "Active"
                                    : "Pending";


                    if (existing.accountStatus == null
                            || existing.accountStatus.isBlank()) {

                        existing.accountStatus = expectedStatus;
                        changed = true;
                    }


                    if (!Objects.equals(
                            existing.fptStudentCode,
                            fptCode
                    )) {
                        existing.fptStudentCode = fptCode;
                        changed = true;
                    }


                    if (!Objects.equals(
                            existing.externalStudentCode,
                            externalCode
                    )) {
                        existing.externalStudentCode = externalCode;
                        changed = true;
                    }


                    if (!Objects.equals(
                            existing.universityName,
                            university
                    )) {
                        existing.universityName = university;
                        changed = true;
                    }


                    return changed
                            ? repo.save(existing)
                            : existing;

                })

                .orElseGet(() -> {

                    AppUser u = new AppUser();

                    u.fullName = name;
                    u.email = email;
                    u.passwordHash = encoder.encode("123456");
                    u.roleName = role;
                    u.userType = userType;
                    u.isApproved = approved;
                    u.accountStatus =
                            approved
                                    ? "Active"
                                    : "Pending";
                    u.fptStudentCode = fptCode;
                    u.externalStudentCode = externalCode;
                    u.universityName = university;


                    return repo.save(u);
                });
    }
    private void normalizeDemoVietnameseText(
            AppUserRepository users,
            HackathonEventRepository events,
            TrackRepository tracks,
            HackathonRoundRepository rounds,
            EventCriterionRepository eventCriteria,
            CriterionTemplateRepository templates,
            CriterionTemplateItemRepository templateItems,
            PrizeRepository prizes,
            AnnouncementRepository announcements,
            AuditLogRepository auditLogs,
            ScoreRepository scores
    ) {

        users.findAll()
                .forEach(user -> {

                    if (user.accountStatus == null
                            || user.accountStatus.isBlank()) {

                        user.accountStatus =
                                Boolean.TRUE.equals(user.isApproved)
                                        ? "Active"
                                        : "Pending";

                        users.save(user);
                    }
                });


        tracks.findAll()
                .forEach(track -> {

                    if (track.status == null
                            || track.status.isBlank()) {

                        track.status = "Active";

                        tracks.save(track);
                    }
                });


        templates.findAll()
                .stream()
                .min(
                        Comparator.comparing(
                                t -> t.templateId
                        )
                )
                .ifPresent(t -> {

                    t.templateName =
                            "Mẫu tiêu chí SEAL mặc định";

                    t.description =
                            "Mẫu tiêu chí chấm điểm dùng lại cho các sự kiện SEAL Hackathon.";

                    templates.save(t);


                    List<CriterionTemplateItem> items =
                            templateItems.findByTemplateIdOrderByDisplayOrderAsc(
                                    t.templateId
                            );


                    if (items.size() >= 5) {

                        items.get(0).criterionName =
                                "Hiện thực kỹ thuật";

                        items.get(1).criterionName =
                                "Tính sáng tạo";

                        items.get(2).criterionName =
                                "UI/UX và độ phù hợp sản phẩm";

                        items.get(3).criterionName =
                                "Thuyết trình";

                        items.get(4).criterionName =
                                "Tính khả thi";


                        templateItems.saveAll(items);
                    }
                });


        events.findAll()
                .stream()
                .filter(
                        e -> "SEAL Summer 2026"
                                .equals(e.eventName)
                )
                .findFirst()
                .ifPresent(event -> {

                    event.description =
                            "Cuộc thi hackathon học thuật ngành Kỹ thuật Phần mềm do Khoa SE phối hợp với PDP tổ chức.";

                    events.save(event);


                    List<Track> eventTracks =
                            tracks.findByEventId(event.eventId)
                                    .stream()
                                    .sorted(
                                            Comparator.comparing(
                                                    t -> t.trackId
                                            )
                                    )
                                    .toList();


                    if (eventTracks.size() >= 2) {

                        eventTracks.get(0).trackName =
                                "Ứng dụng Web";

                        eventTracks.get(0).description =
                                "Sản phẩm web/software engineering có repository, demo và báo cáo kỹ thuật.";


                        eventTracks.get(1).trackName =
                                "AI hỗ trợ giáo dục";

                        eventTracks.get(1).description =
                                "Giải pháp ứng dụng AI để hỗ trợ học tập, định hướng nghề nghiệp hoặc đánh giá năng lực.";


                        tracks.saveAll(
                                eventTracks.subList(0, 2)
                        );
                    }


                    List<HackathonRound> eventRounds =
                            rounds.findByEventIdOrderByRoundOrderAsc(
                                    event.eventId
                            );


                    if (eventRounds.size() >= 3) {

                        eventRounds.get(0).roundName =
                                "Vòng hiệu chuẩn giám khảo";

                        eventRounds.get(1).roundName =
                                "Vòng sơ khảo";

                        eventRounds.get(2).roundName =
                                "Vòng chung kết";


                        rounds.saveAll(
                                eventRounds.subList(0, 3)
                        );
                    }
                    List<EventCriterion> criteria =
                            eventCriteria.findByEventId(event.eventId)
                                    .stream()
                                    .sorted(
                                            Comparator.comparing(
                                                    c -> c.criterionId
                                            )
                                    )
                                    .toList();


                    if (criteria.size() >= 5) {

                        criteria.get(0).criterionName =
                                "Hiện thực kỹ thuật";

                        criteria.get(1).criterionName =
                                "Tính sáng tạo";

                        criteria.get(2).criterionName =
                                "UI/UX và độ phù hợp sản phẩm";

                        criteria.get(3).criterionName =
                                "Thuyết trình";

                        criteria.get(4).criterionName =
                                "Tính khả thi";


                        eventCriteria.saveAll(
                                criteria.subList(0, 5)
                        );
                    }


                    List<Prize> eventPrizes =
                            prizes.findByEventId(event.eventId)
                                    .stream()
                                    .sorted(
                                            Comparator.comparing(
                                                    p -> p.prizeId
                                            )
                                    )
                                    .toList();


                    if (eventPrizes.size() >= 3) {

                        eventPrizes.get(0).prizeName =
                                "Giải Nhất";

                        eventPrizes.get(0).description =
                                "Trao cho đội đứng hạng 1 của hạng mục.";


                        eventPrizes.get(1).prizeName =
                                "Giải Nhì";

                        eventPrizes.get(1).description =
                                "Trao cho đội đứng hạng 2 của hạng mục.";


                        eventPrizes.get(2).prizeName =
                                "Giải Ý tưởng AI";

                        eventPrizes.get(2).description =
                                "Trao cho giải pháp AI có tính ứng dụng cao.";


                        prizes.saveAll(
                                eventPrizes.subList(0, 3)
                        );
                    }


                    announcements.findByEventId(event.eventId)
                            .stream()
                            .min(
                                    Comparator.comparing(
                                            a -> a.announcementId
                                    )
                            )
                            .ifPresent(ann -> {

                                ann.title =
                                        "SEAL Summer 2026 mở cổng đăng ký";

                                ann.content =
                                        "Các đội vui lòng hoàn tất đăng ký, chọn hạng mục và theo dõi hạn nộp bài trong từng vòng thi.";

                                announcements.save(ann);
                            });


                    auditLogs.findByEntityName("HackathonEvent")
                            .stream()
                            .filter(
                                    log -> Objects.equals(
                                            log.entityId,
                                            event.eventId
                                    )
                            )
                            .findFirst()
                            .ifPresent(log -> {

                                log.actionName =
                                        "KHỞI_TẠO_DỮ_LIỆU_DEMO";

                                log.newValue =
                                        "SEAL Summer 2026";

                                auditLogs.save(log);
                            });
                });


        scores.findAll()
                .forEach(score -> {

                    if (score.comment != null
                            && score.comment.contains("?")) {

                        score.comment =
                                score.scoreValue != null
                                        && score.scoreValue.compareTo(
                                        new BigDecimal("8.50")
                                ) >= 0

                                        ? "Có tiềm năng phát triển tiếp."
                                        : "Đáp ứng tốt yêu cầu tiêu chí.";


                        scores.save(score);
                    }
                });
    }
    private void addTemplateItem(
            CriterionTemplateItemRepository repo,
            Integer templateId,
            String name,
            String max,
            String weight,
            int order
    ) {

        CriterionTemplateItem item =
                new CriterionTemplateItem();

        item.templateId = templateId;
        item.criterionName = name;
        item.maxScore = new BigDecimal(max);
        item.weight = new BigDecimal(weight);
        item.displayOrder = order;

        repo.save(item);
    }


    private Track track(
            TrackRepository repo,
            Integer eventId,
            String name,
            String description
    ) {

        Track t = new Track();

        t.eventId = eventId;
        t.trackName = name;
        t.description = description;
        t.status = "Active";

        return repo.save(t);
    }


    private HackathonRound round(
            HackathonRoundRepository repo,
            Integer eventId,
            String name,
            int order,
            LocalDateTime deadline,
            int topN,
            String type,
            boolean calibration
    ) {

        HackathonRound r =
                new HackathonRound();

        r.eventId = eventId;
        r.roundName = name;
        r.roundOrder = order;
        r.submissionDeadline = deadline;
        r.topNAdvance = topN;
        r.roundType = type;
        r.isCalibrationRound = calibration;
        r.startTime = deadline.minusDays(7);
        r.endTime = deadline;

        return repo.save(r);
    }


    private void criterion(
            EventCriterionRepository repo,
            Integer eventId,
            String name,
            String max,
            String weight
    ) {

        EventCriterion c =
                new EventCriterion();

        c.eventId = eventId;
        c.criterionName = name;
        c.maxScore = new BigDecimal(max);
        c.weight = new BigDecimal(weight);
        c.isActive = true;

        repo.save(c);
    }


    private Team team(
            TeamRepository repo,
            Integer eventId,
            Integer trackId,
            String name,
            Integer leaderId,
            String status
    ) {

        Team t =
                new Team();

        t.eventId = eventId;
        t.trackId = trackId;
        t.teamName = name;
        t.leaderId = leaderId;
        t.status = status;

        return repo.save(t);
    }
    private void member(
            TeamMemberRepository repo,
            Integer teamId,
            Integer userId,
            String role
    ) {

        TeamMember m =
                new TeamMember();

        m.teamId = teamId;
        m.userId = userId;
        m.memberRole = role;

        repo.save(m);
    }


    private void assign(
            JudgeAssignmentRepository repo,
            Integer roundId,
            Integer trackId,
            Integer judgeId
    ) {

        JudgeAssignment a =
                new JudgeAssignment();

        a.roundId = roundId;
        a.trackId = trackId;
        a.judgeId = judgeId;

        repo.save(a);
    }


    private void score(
            ScoreRepository repo,
            Integer submissionId,
            Integer judgeId,
            Integer criterionId,
            String value,
            String comment
    ) {

        Score s =
                new Score();

        s.submissionId = submissionId;
        s.judgeId = judgeId;
        s.criterionId = criterionId;
        s.scoreValue = new BigDecimal(value);
        s.comment = comment;

        repo.save(s);
    }


    private void prize(
            PrizeRepository repo,
            Integer eventId,
            Integer trackId,
            String name,
            int rank,
            String description
    ) {

        Prize p =
                new Prize();

        p.eventId = eventId;
        p.trackId = trackId;
        p.prizeName = name;
        p.rankNo = rank;
        p.description = description;

        repo.save(p);
    }
}