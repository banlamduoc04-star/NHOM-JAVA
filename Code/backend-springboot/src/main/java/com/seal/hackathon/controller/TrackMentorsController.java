package com.seal.hackathon.controller;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.AssignTrackMentorRequest;
import com.seal.hackathon.entity.AppUser;
import com.seal.hackathon.entity.TrackMentor;
import com.seal.hackathon.repository.AppUserRepository;
import com.seal.hackathon.repository.TrackMentorRepository;
import com.seal.hackathon.repository.TrackRepository;
import com.seal.hackathon.security.SecurityUtil;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/track-mentors")
public class TrackMentorsController {

    private final TrackMentorRepository trackMentors;
    private final TrackRepository tracks;
    private final AppUserRepository users;

    public TrackMentorsController(
            TrackMentorRepository trackMentors,
            TrackRepository tracks,
            AppUserRepository users
    ) {
        this.trackMentors = trackMentors;
        this.tracks = tracks;
        this.users = users;
    }

    @GetMapping
    public List<TrackMentor> getTrackMentors(
            @RequestParam(required = false) Integer eventId,
            @RequestParam(required = false) Integer trackId,
            @RequestParam(required = false) Integer mentorId
    ) {

        // Admin có thể xem mentor bất kỳ, mentor chỉ xem dữ liệu của chính mình
        Integer effectiveMentorId = SecurityUtil.isAdmin()
                ? mentorId
                : SecurityUtil.currentUserId();

        List<TrackMentor> data;

        if (trackId != null) {
            data = trackMentors.findByTrackId(trackId);
        }
        else if (effectiveMentorId != null) {
            data = trackMentors.findByMentorId(effectiveMentorId);

        } 
        else {
            data = trackMentors.findAll();
        }

        // Mentor không được xem phân công của mentor khác
        if (!SecurityUtil.isAdmin()) {
            Integer currentUserId = SecurityUtil.currentUserId();

            data = data.stream()
                    .filter(tm -> currentUserId.equals(tm.mentorId))
                    .toList();
        }
        if (eventId == null) {
            return data;
        }

        // Lọc các track thuộc sự kiện được yêu cầu
        Set<Integer> trackIds = tracks.findByEventId(eventId)
                .stream()
                .map(track -> track.trackId)
                .collect(Collectors.toSet());

        return data.stream()
                .filter(trackMentor -> trackIds.contains(trackMentor.trackId))
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public TrackMentor assignTrackMentor(
            @Valid @RequestBody AssignTrackMentorRequest request
    ) {

        if (!tracks.existsById(request.trackId())) {
            throw new ResourceNotFoundException("Không tìm thấy hạng mục");
        }

        AppUser mentor = users.findById(request.mentorId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Không tìm thấy người được phân công"));

        // Chỉ Mentor/Giảng viên/Nhân sự mới được phân công mentor
        if ("TeamMember".equals(mentor.roleName)) {
            throw new IllegalArgumentException(
                    "Chỉ tài khoản nhân sự/giảng viên mới được phân công mentor"
            );
        }

        // Tránh gán trùng mentor cho cùng một track
        if (trackMentors.existsByTrackIdAndMentorId(
                request.trackId(),
                request.mentorId()
        )) {

            throw new IllegalArgumentException(
                    "Người này đã được gán mentor vào hạng mục này"
            );
        }

        TrackMentor trackMentor = new TrackMentor();
        trackMentor.trackId = request.trackId();
        trackMentor.mentorId = request.mentorId();

        return trackMentors.save(trackMentor);
    }

    @DeleteMapping("/{trackMentorId}")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    @Transactional
    public void removeTrackMentor(
            @PathVariable Integer trackMentorId
    ) {

        if (!trackMentors.existsById(trackMentorId)) {
            throw new ResourceNotFoundException(
                    "Không tìm thấy phân công mentor"
            );
        }

        trackMentors.deleteById(trackMentorId);
    }
}