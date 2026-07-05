package com.seal.hackathon.controller;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.CreateJudgeAssignmentRequest;
import com.seal.hackathon.entity.AppUser;
import com.seal.hackathon.entity.JudgeAssignment;
import com.seal.hackathon.repository.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/judge-assignments")
@PreAuthorize("hasRole('EventCoordinator')")
public class JudgeAssignmentsController {
    private final JudgeAssignmentRepository assignments; private final AppUserRepository users; private final HackathonRoundRepository rounds; private final TrackRepository tracks;
    public JudgeAssignmentsController(JudgeAssignmentRepository assignments, AppUserRepository users, HackathonRoundRepository rounds, TrackRepository tracks) { this.assignments=assignments; this.users=users; this.rounds=rounds; this.tracks=tracks; }
    @PostMapping public JudgeAssignment create(@Valid @RequestBody CreateJudgeAssignmentRequest r) {
        if(!rounds.existsById(r.roundId())) throw new ResourceNotFoundException("Không tìm thấy vòng thi");
        if(!tracks.existsById(r.trackId())) throw new ResourceNotFoundException("Không tìm thấy hạng mục");
        AppUser judge = users.findById(r.judgeId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giám khảo"));
        if(!("Judge".equals(judge.roleName) || "GuestJudge".equals(judge.roleName))) throw new IllegalArgumentException("Người dùng phải có vai trò Giám khảo hoặc Giám khảo khách mời");
        if(assignments.existsByRoundIdAndTrackIdAndJudgeId(r.roundId(), r.trackId(), r.judgeId())) throw new IllegalArgumentException("Giám khảo đã được phân công cho vòng và hạng mục này");
        JudgeAssignment ja = new JudgeAssignment(); ja.roundId=r.roundId(); ja.trackId=r.trackId(); ja.judgeId=r.judgeId(); return assignments.save(ja);
    }
    @GetMapping public List<JudgeAssignment> getAll() { return assignments.findAll(); }
    @DeleteMapping("/{assignmentId}") public void delete(@PathVariable Integer assignmentId) { assignments.deleteById(assignmentId); }
}
