package com.seal.hackathon.config;

import com.seal.hackathon.entity.*;
import com.seal.hackathon.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Configuration
public class DataInitializer {
    @Bean
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
            AppUser coordinator = user(users, encoder, "Điều phối viên SEAL", "coordinator@seal.edu.vn", "EventCoordinator", "Staff", true, null, null, null);
            AppUser mentor = user(users, encoder, "Mentor Nguyễn Minh", "mentor@seal.edu.vn", "Mentor", "Staff", true, null, null, null);
            AppUser judge = user(users, encoder, "Giám khảo Trần Anh", "judge@seal.edu.vn", "Judge", "Staff", true, null, null, null);
            AppUser guestJudge = user(users, encoder, "Giám khảo khách mời Lê Hà", "guestjudge@seal.edu.vn", "GuestJudge", "Staff", true, null, null, null);
            AppUser student1 = user(users, encoder, "Nguyễn Văn A", "leader1@seal.edu.vn", "TeamMember", "Student", true, "SE170001", null, null);
            AppUser student2 = user(users, encoder, "Trần Thị B", "member2@seal.edu.vn", "TeamMember", "Student", true, "SE170002", null, null);
            AppUser student3 = user(users, encoder, "Lê Văn C", "member3@seal.edu.vn", "TeamMember", "Student", true, "SE170003", null, null);
            AppUser student4 = user(users, encoder, "Phạm Quốc D", "partner1@seal.edu.vn", "TeamMember", "Student", true, null, "HCMUT001", "Trường Đại học Bách khoa TP.HCM");
            user(users, encoder, "Sinh viên chờ duyệt", "pending@seal.edu.vn", "TeamMember", "Student", false, "SE170099", null, null);

            if (templates.count() == 0) {
                CriterionTemplate t = new CriterionTemplate();
                t.templateName = "Mẫu tiêu chí SEAL mặc định";
                t.description = "Mẫu tiêu chí chấm điểm dùng lại cho các sự kiện SEAL Hackathon.";
                templates.save(t);
                addTemplateItem(templateItems, t.templateId, "Hiện thực kỹ thuật", "10", "0.35", 1);
                addTemplateItem(templateItems, t.templateId, "Tính sáng tạo", "10", "0.20", 2);
                addTemplateItem(templateItems, t.templateId, "UI/UX và độ phù hợp sản phẩm", "10", "0.20", 3);
                addTemplateItem(templateItems, t.templateId, "Thuyết trình", "10", "0.15", 4);
                addTemplateItem(templateItems, t.templateId, "Tính khả thi", "10", "0.10", 5);
            }

            if (events.count() == 0) {
                HackathonEvent event = new HackathonEvent();
                event.eventName = "SEAL Summer 2026";
                event.season = "Summer";
                event.eventYear = 2026;
                event.startDate = LocalDate.of(2026, 7, 1);
                event.endDate = LocalDate.of(2026, 7, 31);
                event.status = "Open";
                event.description = "Cuộc thi hackathon học thuật ngành Kỹ thuật Phần mềm do Khoa SE phối hợp với PDP tổ chức.";
                event.createdBy = coordinator.userId;
                events.save(event);

                Track web = track(tracks, event.eventId, "Ứng dụng Web", "Sản phẩm web/software engineering có repository, demo và báo cáo kỹ thuật.");
                Track ai = track(tracks, event.eventId, "AI hỗ trợ giáo dục", "Giải pháp ứng dụng AI để hỗ trợ học tập, định hướng nghề nghiệp hoặc đánh giá năng lực.");

                HackathonRound calibration = round(rounds, event.eventId, "Vòng hiệu chuẩn giám khảo", 0, LocalDateTime.of(2026, 7, 5, 23, 59), 0, "Calibration", true);
                HackathonRound preliminary = round(rounds, event.eventId, "Vòng sơ khảo", 1, LocalDateTime.of(2026, 7, 15, 23, 59), 5, "Competition", false);
                round(rounds, event.eventId, "Vòng chung kết", 2, LocalDateTime.of(2026, 7, 25, 23, 59), 3, "Competition", false);

                criterion(eventCriteria, event.eventId, "Hiện thực kỹ thuật", "10", "0.35");
                criterion(eventCriteria, event.eventId, "Tính sáng tạo", "10", "0.20");
                criterion(eventCriteria, event.eventId, "UI/UX và độ phù hợp sản phẩm", "10", "0.20");
                criterion(eventCriteria, event.eventId, "Thuyết trình", "10", "0.15");
                criterion(eventCriteria, event.eventId, "Tính khả thi", "10", "0.10");

                Team team = team(teams, event.eventId, web.trackId, "SEAL Builders", student1.userId, "Approved");
                member(members, team.teamId, student1.userId, "Leader");
                member(members, team.teamId, student2.userId, "Member");
                member(members, team.teamId, student3.userId, "Member");
                member(members, team.teamId, student4.userId, "Member");

                Team team2 = team(teams, event.eventId, ai.trackId, "Agile Coders", student4.userId, "Pending");
                member(members, team2.teamId, student4.userId, "Leader");
                member(members, team2.teamId, student1.userId, "Member");
                member(members, team2.teamId, student2.userId, "Member");

                assign(assignments, preliminary.roundId, web.trackId, judge.userId);
                assign(assignments, preliminary.roundId, web.trackId, guestJudge.userId);
                assign(assignments, calibration.roundId, web.trackId, judge.userId);

                Submission sub = new Submission();
                sub.teamId = team.teamId;
                sub.roundId = preliminary.roundId;
                sub.repositoryUrl = "https://github.com/seal-demo/seal-builders";
                sub.demoUrl = "https://seal-demo.example.com";
                sub.reportUrl = "https://drive.google.com/seal-builders-report";
                submissions.save(sub);

                for (EventCriterion c : eventCriteria.findByEventId(event.eventId)) {
                    score(scores, sub.submissionId, judge.userId, c.criterionId, c.criterionName.contains("kỹ thuật") ? "8.50" : "8.00", "Đáp ứng tốt yêu cầu tiêu chí.");
                    score(scores, sub.submissionId, guestJudge.userId, c.criterionId, c.criterionName.contains("sáng tạo") ? "9.00" : "8.20", "Có tiềm năng phát triển tiếp.");
                }

                prize(prizes, event.eventId, web.trackId, "Giải Nhất", 1, "Trao cho đội đứng hạng 1 của hạng mục.");
                prize(prizes, event.eventId, web.trackId, "Giải Nhì", 2, "Trao cho đội đứng hạng 2 của hạng mục.");
                prize(prizes, event.eventId, ai.trackId, "Giải Ý tưởng AI", 1, "Trao cho giải pháp AI có tính ứng dụng cao.");

                Announcement ann = new Announcement();
                ann.eventId = event.eventId;
                ann.trackId = null;
                ann.createdBy = coordinator.userId;
                ann.targetRole = "All";
                ann.title = "SEAL Summer 2026 mở cổng đăng ký";
                ann.content = "Các đội vui lòng hoàn tất đăng ký, chọn hạng mục và theo dõi hạn nộp bài trong từng vòng thi.";
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
        };
    }

    private AppUser user(AppUserRepository repo, PasswordEncoder encoder, String name, String email, String role, String userType, boolean approved, String fptCode, String externalCode, String university) {
        return repo.findByEmail(email).orElseGet(() -> {
            AppUser u = new AppUser();
            u.fullName = name;
            u.email = email;
            u.passwordHash = encoder.encode("123456");
            u.roleName = role;
            u.userType = userType;
            u.isApproved = approved;
            u.fptStudentCode = fptCode;
            u.externalStudentCode = externalCode;
            u.universityName = university;
            return repo.save(u);
        });
    }

    private void addTemplateItem(CriterionTemplateItemRepository repo, Integer templateId, String name, String max, String weight, int order) {
        CriterionTemplateItem item = new CriterionTemplateItem();
        item.templateId = templateId;
        item.criterionName = name;
        item.maxScore = new BigDecimal(max);
        item.weight = new BigDecimal(weight);
        item.displayOrder = order;
        repo.save(item);
    }

    private Track track(TrackRepository repo, Integer eventId, String name, String description) {
        Track t = new Track();
        t.eventId = eventId;
        t.trackName = name;
        t.description = description;
        return repo.save(t);
    }

    private HackathonRound round(HackathonRoundRepository repo, Integer eventId, String name, int order, LocalDateTime deadline, int topN, String type, boolean calibration) {
        HackathonRound r = new HackathonRound();
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

    private void criterion(EventCriterionRepository repo, Integer eventId, String name, String max, String weight) {
        EventCriterion c = new EventCriterion();
        c.eventId = eventId;
        c.criterionName = name;
        c.maxScore = new BigDecimal(max);
        c.weight = new BigDecimal(weight);
        c.isActive = true;
        repo.save(c);
    }

    private Team team(TeamRepository repo, Integer eventId, Integer trackId, String name, Integer leaderId, String status) {
        Team t = new Team();
        t.eventId = eventId;
        t.trackId = trackId;
        t.teamName = name;
        t.leaderId = leaderId;
        t.status = status;
        return repo.save(t);
    }

    private void member(TeamMemberRepository repo, Integer teamId, Integer userId, String role) {
        TeamMember m = new TeamMember();
        m.teamId = teamId;
        m.userId = userId;
        m.memberRole = role;
        repo.save(m);
    }

    private void assign(JudgeAssignmentRepository repo, Integer roundId, Integer trackId, Integer judgeId) {
        JudgeAssignment a = new JudgeAssignment();
        a.roundId = roundId;
        a.trackId = trackId;
        a.judgeId = judgeId;
        repo.save(a);
    }

    private void score(ScoreRepository repo, Integer submissionId, Integer judgeId, Integer criterionId, String value, String comment) {
        Score s = new Score();
        s.submissionId = submissionId;
        s.judgeId = judgeId;
        s.criterionId = criterionId;
        s.scoreValue = new BigDecimal(value);
        s.comment = comment;
        repo.save(s);
    }

    private void prize(PrizeRepository repo, Integer eventId, Integer trackId, String name, int rank, String description) {
        Prize p = new Prize();
        p.eventId = eventId;
        p.trackId = trackId;
        p.prizeName = name;
        p.rankNo = rank;
        p.description = description;
        repo.save(p);
    }
}