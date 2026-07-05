package com.seal.hackathon.controller;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.*;
import com.seal.hackathon.entity.*;
import com.seal.hackathon.repository.*;
import com.seal.hackathon.security.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementsController {
    private final AnnouncementRepository announcements; private final AnnouncementRecipientRepository recipients;
    public AnnouncementsController(AnnouncementRepository announcements, AnnouncementRecipientRepository recipients) { this.announcements=announcements; this.recipients=recipients; }
    @GetMapping("/event/{eventId}") public List<Announcement> byEvent(@PathVariable Integer eventId, @RequestParam(required=false) Integer trackId) { return trackId == null ? announcements.findByEventId(eventId) : announcements.findByEventIdAndTrackId(eventId, trackId); }
    @GetMapping("/my") public List<AnnouncementRecipient> my(@RequestParam(required=false) Integer eventId) { return recipients.findByUserId(SecurityUtil.currentUserId()); }
    @PostMapping @PreAuthorize("hasRole('EventCoordinator')") public Announcement create(@Valid @RequestBody CreateAnnouncementRequest r) { Announcement a=new Announcement(); a.eventId=r.eventId(); a.trackId=r.trackId(); a.createdBy=SecurityUtil.currentUserId(); a.targetRole=r.targetRole()==null?"All":r.targetRole(); a.title=r.title(); a.content=r.content(); a.isPublished=r.isPublished()==null || r.isPublished(); return announcements.save(a); }
    @PutMapping("/{announcementId}") @PreAuthorize("hasRole('EventCoordinator')") public Announcement update(@PathVariable Integer announcementId, @RequestBody UpdateAnnouncementRequest r) { Announcement a=announcements.findById(announcementId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo")); if(r.trackId()!=null) a.trackId=r.trackId(); if(r.targetRole()!=null) a.targetRole=r.targetRole(); if(r.title()!=null) a.title=r.title(); if(r.content()!=null) a.content=r.content(); if(r.isPublished()!=null) a.isPublished=r.isPublished(); return announcements.save(a); }
    @PostMapping("/{announcementId}/read") public AnnouncementRecipient read(@PathVariable Integer announcementId) { if(!announcements.existsById(announcementId)) throw new ResourceNotFoundException("Không tìm thấy thông báo"); Integer userId=SecurityUtil.currentUserId(); AnnouncementRecipient ar=recipients.findByAnnouncementIdAndUserId(announcementId, userId).orElseGet(AnnouncementRecipient::new); ar.announcementId=announcementId; ar.userId=userId; ar.isRead=true; ar.readAt= LocalDateTime.now(); return recipients.save(ar); }
}
