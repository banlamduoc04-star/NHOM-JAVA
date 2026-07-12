package com.seal.hackathon.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.*;
import com.seal.hackathon.dto.CommonDtos.CreateAnnouncementRequest;
import com.seal.hackathon.dto.CommonDtos.UpdateAnnouncementRequest;
import com.seal.hackathon.entity.Announcement;
import com.seal.hackathon.entity.AnnouncementRecipient;
import com.seal.hackathon.repository.AnnouncementRecipientRepository;
import com.seal.hackathon.repository.AnnouncementRepository;
import com.seal.hackathon.security.SecurityUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementsController {

    private final AnnouncementRepository announcements;
    private final AnnouncementRecipientRepository recipients;

    public AnnouncementsController(
            AnnouncementRepository announcements,
            AnnouncementRecipientRepository recipients
    ) {
        this.announcements = announcements;
        this.recipients = recipients;
    }

    @GetMapping("/event/{eventId}")
    public List<Announcement> byEvent(
            @PathVariable Integer eventId,
            @RequestParam(required = false) Integer trackId
    ) {

        return trackId == null
                ? announcements.findByEventId(eventId)
                : announcements.findByEventIdAndTrackId(eventId, trackId);
    }

    @GetMapping("/my")
    public List<AnnouncementRecipient> my(
            @RequestParam(required = false) Integer eventId
    ) {

        return recipients.findByUserId(SecurityUtil.currentUserId());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public Announcement create(
            @Valid @RequestBody CreateAnnouncementRequest r
    ) {

        Announcement a = new Announcement();

        a.eventId = r.eventId();
        a.trackId = r.trackId();
        a.createdBy = SecurityUtil.currentUserId();

        a.targetRole = r.targetRole() == null
                ? "All"
                : r.targetRole();

        a.title = r.title();
        a.content = r.content();

        a.isPublished = r.isPublished() == null
                || r.isPublished();

        return announcements.save(a);
    }

    @PutMapping("/{announcementId}")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public Announcement update(
            @PathVariable Integer announcementId,
            @RequestBody UpdateAnnouncementRequest r
    ) {

        Announcement a = announcements.findById(announcementId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Không tìm thấy thông báo")
                );

        if (r.trackId() != null) {
            a.trackId = r.trackId();
        }

        if (r.targetRole() != null) {
            a.targetRole = r.targetRole();
        }

        if (r.title() != null) {
            a.title = r.title();
        }

        if (r.content() != null) {
            a.content = r.content();
        }

        if (r.isPublished() != null) {
            a.isPublished = r.isPublished();
        }

        return announcements.save(a);
    }

    @PostMapping("/{announcementId}/read")
    public AnnouncementRecipient read(
            @PathVariable Integer announcementId
    ) {

        if (!announcements.existsById(announcementId)) {
            throw new ResourceNotFoundException("Không tìm thấy thông báo");
        }

        Integer userId = SecurityUtil.currentUserId();

        AnnouncementRecipient ar = recipients
                .findByAnnouncementIdAndUserId(announcementId, userId)
                .orElseGet(AnnouncementRecipient::new);

        ar.announcementId = announcementId;
        ar.userId = userId;
        ar.isRead = true;
        ar.readAt = LocalDateTime.now();

        return recipients.save(ar);
    }
}