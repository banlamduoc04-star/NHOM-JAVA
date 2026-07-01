package com.seal.hackathon.controller;

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
import com.seal.hackathon.dto.CommonDtos.CreateTrackRequest;
import com.seal.hackathon.dto.CommonDtos.UpdateTrackRequest;
import com.seal.hackathon.entity.Track;
import com.seal.hackathon.repository.HackathonEventRepository;
import com.seal.hackathon.repository.TrackRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tracks")
public class TracksController {
    private final TrackRepository tracks; private final HackathonEventRepository events;
    public TracksController(TrackRepository tracks, HackathonEventRepository events) { this.tracks = tracks; this.events = events; }
    @GetMapping public List<Track> getTracks(@RequestParam(required=false) Integer eventId) { return eventId == null ? tracks.findAll() : tracks.findByEventId(eventId); }
    @PostMapping @PreAuthorize("hasRole('EventCoordinator')")
    public Track createTrack(@Valid @RequestBody CreateTrackRequest request) {
        if (!events.existsById(request.eventId())) throw new ResourceNotFoundException("Không tìm thấy sự kiện");
        Track t = new Track(); t.eventId = request.eventId(); t.trackName = request.trackName(); t.description = request.description(); return tracks.save(t);
    }
    @PutMapping("/{trackId}") @PreAuthorize("hasRole('EventCoordinator')")
    public Track updateTrack(@PathVariable Integer trackId, @RequestBody UpdateTrackRequest request) {
        Track t = tracks.findById(trackId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hạng mục"));
        if (request.trackName()!=null) t.trackName=request.trackName(); if (request.description()!=null) t.description=request.description(); return tracks.save(t);
    }
}
