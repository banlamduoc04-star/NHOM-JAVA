package com.seal.hackathon.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.CreateEventRequest;
import com.seal.hackathon.dto.CommonDtos.UpdateEventRequest;
import com.seal.hackathon.entity.HackathonEvent;
import com.seal.hackathon.repository.HackathonEventRepository;
import com.seal.hackathon.security.SecurityUtil;
import com.seal.hackathon.service.AuditService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/events")
public class EventsController {
    private final HackathonEventRepository events;
    private final AuditService audit;

    public EventsController(HackathonEventRepository events, AuditService audit) {
        this.events = events;
        this.audit = audit;
    }

    @GetMapping
    public List<HackathonEvent> getEvents() {
        return events.findAll();
    }

    @GetMapping("/{eventId}")
    public HackathonEvent getEventById(@PathVariable Integer eventId) {
        return events.findById(eventId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sự kiện"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public HackathonEvent createEvent(@Valid @RequestBody CreateEventRequest request) {
        HackathonEvent e = new HackathonEvent();
        e.eventName = request.eventName();
        e.season = request.season();
        e.eventYear = request.eventYear();
        e.startDate = request.startDate();
        e.endDate = request.endDate();
        e.status = request.status() == null ? "Draft" : request.status();
        e.description = request.description();
        e.createdBy = SecurityUtil.currentUserId();
        HackathonEvent saved = events.save(e);
        audit.log(SecurityUtil.currentUserId(), "CREATE_EVENT", "HackathonEvent", saved.eventId, null, saved.eventName);
        return saved;
    }

    @PutMapping("/{eventId}")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public HackathonEvent updateEvent(@PathVariable Integer eventId, @RequestBody UpdateEventRequest request) {
        HackathonEvent e = getEventById(eventId);
        if (request.eventName() != null) e.eventName = request.eventName();
        if (request.season() != null) e.season = request.season();
        if (request.eventYear() != null) e.eventYear = request.eventYear();
        if (request.startDate() != null) e.startDate = request.startDate();
        if (request.endDate() != null) e.endDate = request.endDate();
        if (request.status() != null) e.status = request.status();
        if (request.description() != null) e.description = request.description();
        HackathonEvent saved = events.save(e);
        audit.log(SecurityUtil.currentUserId(), "UPDATE_EVENT", "HackathonEvent", saved.eventId, null, saved.eventName);
        return saved;
    }

    @DeleteMapping("/{eventId}")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public void deleteEvent(@PathVariable Integer eventId) {
        HackathonEvent event = getEventById(eventId);
        events.delete(event);
        audit.log(SecurityUtil.currentUserId(), "DELETE_EVENT", "HackathonEvent", eventId, event.eventName, null);
    }
}
