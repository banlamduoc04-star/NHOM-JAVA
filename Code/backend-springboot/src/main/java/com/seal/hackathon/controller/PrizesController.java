package com.seal.hackathon.controller;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.*;
import com.seal.hackathon.entity.*;
import com.seal.hackathon.repository.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prizes")
public class PrizesController {
    private final PrizeRepository prizes; private final TeamPrizeRepository teamPrizes; private final HackathonEventRepository events; private final TrackRepository tracks; private final TeamRepository teams;
    public PrizesController(PrizeRepository prizes, TeamPrizeRepository teamPrizes, HackathonEventRepository events, TrackRepository tracks, TeamRepository teams) { this.prizes=prizes; this.teamPrizes=teamPrizes; this.events=events; this.tracks=tracks; this.teams=teams; }
    @GetMapping public List<Prize> getPrizes(@RequestParam(required=false) Integer eventId, @RequestParam(required=false) Integer trackId) { if(eventId!=null && trackId!=null) return prizes.findByEventIdAndTrackId(eventId, trackId); if(eventId!=null) return prizes.findByEventId(eventId); if(trackId!=null) return prizes.findByTrackId(trackId); return prizes.findAll(); }
    @PostMapping @PreAuthorize("hasRole('EventCoordinator')") public Prize create(@Valid @RequestBody CreatePrizeRequest r) { if(!events.existsById(r.eventId())) throw new ResourceNotFoundException("Không tìm thấy sự kiện"); if(!tracks.existsById(r.trackId())) throw new ResourceNotFoundException("Không tìm thấy hạng mục"); Prize p=new Prize(); p.eventId=r.eventId(); p.trackId=r.trackId(); p.prizeName=r.prizeName(); p.rankNo=r.rankNo(); p.description=r.description(); return prizes.save(p); }
    @PostMapping("/award") @PreAuthorize("hasRole('EventCoordinator')") public TeamPrize award(@Valid @RequestBody AwardPrizeRequest r) { if(!teams.existsById(r.teamId())) throw new ResourceNotFoundException("Không tìm thấy đội thi"); if(!prizes.existsById(r.prizeId())) throw new ResourceNotFoundException("Không tìm thấy giải thưởng"); if(teamPrizes.existsByTeamIdAndPrizeId(r.teamId(), r.prizeId())) throw new IllegalArgumentException("Giải thưởng đã được trao cho đội này"); TeamPrize tp=new TeamPrize(); tp.teamId=r.teamId(); tp.prizeId=r.prizeId(); return teamPrizes.save(tp); }
}
